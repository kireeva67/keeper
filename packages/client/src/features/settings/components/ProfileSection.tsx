import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useUser } from "../../../shared/api/useUser";
import { UserAvatar } from "../../../shared/components/UserAvatar";
import { validatePassword } from "../../../shared/utils/validatePassword";
import { PasswordTextField } from "../../../shared/components/PasswordTextField";
import { ForgotPasswordButton } from "../../../shared/components/ForgotPasswordButton";
import { FROM_STATE } from "../../../shared/types/FromStateType";

export function ProfileSection() {
    const { email, hasPassword, updatePassword } = useUser();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string }>({});
    const [success, setSuccess] = useState(false);

    const onSubmit = async () => {
        const next: typeof errors = {};
        if (hasPassword && !currentPassword) next.current = "Required";
        const newError = validatePassword(newPassword);
        if (newError) next.new = newError;
        if (Object.keys(next).length) {
            setErrors(next);
            return;
        }
        try {
            await updatePassword(newPassword, hasPassword ? currentPassword : undefined);
            setCurrentPassword("");
            setNewPassword("");
            setErrors({});
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } catch {
            setSuccess(false);
            setErrors({ current: "Current password is incorrect" });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>Profile</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, mb: 2 }}>
                <UserAvatar />
                <Typography color="text.secondary">{email}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: '100%' }}>
                {hasPassword && (
                    <PasswordTextField
                        label="Current password" size="small" fullWidth
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        error={!!errors.new} helperText={errors.new}
                    />
                )}
                <PasswordTextField
                    label="New password" size="small" fullWidth
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    error={!!errors.new} helperText={errors.new}
                />
                {hasPassword && <Box sx={{ alignSelf: 'flex-start' }}><ForgotPasswordButton from={FROM_STATE.SETTINGS} /></Box>}
                {success && (
                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", px: 1.5, py: 0.5, borderRadius: 1, textAlign: 'center' }}
                    >
                        Password updated successfully
                    </Typography>
                )}
                <Button variant="contained" fullWidth onClick={onSubmit}>
                    {hasPassword ? "Update password" : "Set password"}
                </Button>
            </Box>
        </Box>
    );
}

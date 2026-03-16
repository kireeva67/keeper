import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useUser } from "../../../shared/api/useUser";
import { UserAvatar } from "../../../shared/components/UserAvatar";
import { validatePassword } from "../../../shared/utils/validatePassword";

export function ProfileSection() {
    const { email, hasPassword, updatePassword } = useUser();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string }>({});
    const [success, setSuccess] = useState(false);
    const [show, setShow] = useState({ current: false, new: false });

    const toggleShow = (field: keyof typeof show) =>
        setShow(prev => ({ ...prev, [field]: !prev[field] }));

    const eyeAdornment = (field: keyof typeof show) => ({
        endAdornment: (
            <InputAdornment position="end">
                <IconButton size="small" onClick={() => toggleShow(field)} edge="end">
                    {show[field] ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                </IconButton>
            </InputAdornment>
        ),
    });

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
        <Box>
            <Typography variant="overline" color="text.secondary">Profile</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, mb: 2 }}>
                <UserAvatar />
                <Typography color="text.secondary">{email}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {hasPassword && (
                    <TextField
                        label="Current password" size="small" fullWidth
                        type={show.current ? "text" : "password"}
                        value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        error={!!errors.current} helperText={errors.current}
                        slotProps={{ input: eyeAdornment("current") }}
                    />
                )}
                <TextField
                    label="New password" size="small" fullWidth
                    type={show.new ? "text" : "password"}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    error={!!errors.new} helperText={errors.new}
                    slotProps={{ input: eyeAdornment("new") }}
                />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                    {success && (
                        <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", px: 1.5, py: 0.5, borderRadius: 1 }}
                        >
                            Password updated successfully
                        </Typography>
                    )}
                    <Button variant="contained" onClick={onSubmit}>
                        {hasPassword ? "Update password" : "Set password"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

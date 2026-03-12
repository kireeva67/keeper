import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useUser } from "../../../shared/api/useUser";
import { UserAvatar } from "../../../shared/components/UserAvatar";

export function ProfileSection() {
    const { email, hasPassword, updatePassword } = useUser();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
    const [success, setSuccess] = useState(false);
    const [show, setShow] = useState({ current: false, new: false, confirm: false });

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

    const handlePasswordSubmit = async () => {
        const next: typeof errors = {};
        if (hasPassword && !currentPassword) next.current = "Required";
        if (newPassword.length < 8) next.new = "At least 8 characters";
        else if (!/\d/.test(newPassword)) next.new = "Must contain a number";
        else if (!/[!@#$%^&*()_+\-={}[\];':"\\|,.<>?]/.test(newPassword)) next.new = "Must contain a special character";
        if (confirmPassword !== newPassword) next.confirm = "Passwords don't match";
        if (Object.keys(next).length) { setErrors(next); return; }

        try {
            await updatePassword(newPassword, hasPassword ? currentPassword : undefined);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toggleShow("current");
            toggleShow("new");
            toggleShow("confirm");
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
                <TextField
                    label="Confirm new password" size="small" fullWidth
                    type={show.confirm ? "text" : "password"}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    error={!!errors.confirm} helperText={errors.confirm}
                    slotProps={{ input: eyeAdornment("confirm") }}
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
                    <Button variant="contained" onClick={handlePasswordSubmit}>
                        {hasPassword ? "Update password" : "Set password"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

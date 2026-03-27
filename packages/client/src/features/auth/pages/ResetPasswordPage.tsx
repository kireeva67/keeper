import { Container, Typography, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LOGIN_ROUTE } from "../config/authURLS";
import { PasswordTextField } from "../../../shared/components/PasswordTextField";
import { validatePassword } from "../../../shared/utils/validatePassword";
import { onResetPassword } from "../api/onResetPassword";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errors, setErrors] = useState<{ new?: string; confirm?: string; general?: string }>({});
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = async () => {
        const next: typeof errors = {};
        if (!confirmPassword) next.confirm = "Required";
        else if (confirmPassword !== newPassword) next.confirm = "Passwords do not match";
        const newError = validatePassword(newPassword);
        if (newError) next.new = newError;
        if (Object.keys(next).length) {
            setErrors(next);
            return;
        }
        setSubmitting(true);
        try {
            await onResetPassword({ password: newPassword, token });
            setSuccess(true);
            setTimeout(() => navigate(LOGIN_ROUTE), 2000);
        } catch {
            setErrors({ general: "Something went wrong. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (!token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Typography variant="h6" gutterBottom>Reset Password</Typography>
                <Typography color="error">This link is invalid or has expired.</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate(LOGIN_ROUTE)}>Back to login</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h6" gutterBottom>
                Reset Password
            </Typography>

            <Stack spacing={2}>
                <PasswordTextField
                    label="New password" size="small" fullWidth
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    error={!!errors.new} helperText={errors.new}
                />

                <PasswordTextField
                    label="Confirm password" size="small" fullWidth
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    error={!!errors.confirm} helperText={errors.confirm}
                />

                {errors.general && (
                    <Typography variant="body2" color="error">{errors.general}</Typography>
                )}

                {success
                    ? <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", px: 1.5, py: 0.5, borderRadius: 1 }}
                    >
                        Password reset successfully. Redirecting to login...
                    </Typography>
                    : <Button variant="contained" onClick={onSubmit} disabled={submitting}>
                        Submit
                    </Button>
                }
            </Stack>
        </Container>
    );
}

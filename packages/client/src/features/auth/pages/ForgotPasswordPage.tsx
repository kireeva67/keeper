import { Container, Typography, Button, TextField, Stack, Link } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, SETTINGS_ROUTE } from "../config/authURLS";
import { onForgotPassword } from "../api/onForgotPassword";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from === 'settings' ? SETTINGS_ROUTE : LOGIN_ROUTE;
    const label = location.state?.from === 'settings' ? 'Back to settings' : 'Back to sign in';
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        setSubmitting(true);
        try {
            await onForgotPassword(email);
            setSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h6" gutterBottom>
                Forgot password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                We'll send a reset link to your email.
            </Typography>

            <Stack spacing={2}>
                <TextField label="Email" size="small" type="email" fullWidth
                    value={email} onChange={e => { setEmail(e.target.value); setError(null); }}
                    error={!!error} helperText={error}
                    disabled={success}
                />

                {success
                    ? <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", px: 1.5, py: 0.5, borderRadius: 1 }}
                    >
                        If this email is registered, you'll receive a reset link
                    </Typography>
                    : <Button variant="contained" onClick={onSubmit} disabled={submitting || !email.trim()}>
                        Submit
                    </Button>
                }

                <Link component="button" variant="body2" onClick={() => navigate(from)}>
                    {label}
                </Link>
            </Stack>
        </Container>
    );
}

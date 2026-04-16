import { Box, Button, Divider, TextField, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, PRODUCTS_ROUTE } from "../config/authURLS";
import { useState } from "react";
import { PasswordTextField } from "../../../shared/components/PasswordTextField";
import { addUser } from "../api/addUser";
import { validatePassword } from "../../../shared/utils/validatePassword";
import { useAuth } from "../api/useAuth";
import { GoogleSSOButton } from "../components/GoogleSSOButton";
import { KeeperLogo } from "../../../shared/components/KeeperLogo";

export default function SignUpPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { setAuthenticated } = useAuth();

    const onSubmit = async () => {
        const next: typeof errors = {};
        const passwordError = validatePassword(password);
        if (passwordError) next.password = passwordError;
        if (Object.keys(next).length) {
            setErrors(next);
            return;
        }
        try {
            await addUser({ email, password });
            setAuthenticated(true);
            navigate(PRODUCTS_ROUTE);
        } catch (e) {
            const err = e as { status?: number; message?: string };
            if (err?.status === 409) {
                setErrors({ email: err.message });
            } else {
                setErrors({ password: "Sign up failed. Please try again." });
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <KeeperLogo width={92} height={92} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    your personal keeper
                </Typography>
            </Box>

            <Stack spacing={2}>
                <GoogleSSOButton />

                <Divider>or</Divider>

                <TextField label="Email" size="small" type="email" fullWidth
                    value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                    error={!!errors.email} helperText={errors.email}
                />
                <PasswordTextField
                    label="Password" size="small" fullWidth
                    value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                    error={!!errors.password} helperText={errors.password}
                />
                <Button variant="contained" onClick={onSubmit}>
                    Create account
                </Button>

                <Button variant="text" onClick={() => navigate(LOGIN_ROUTE)}>
                    Already have an account? Sign in
                </Button>
            </Stack>
        </>
    );
}

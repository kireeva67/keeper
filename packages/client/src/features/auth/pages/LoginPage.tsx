import { Container, Typography, Button, TextField, Stack, Divider } from "@mui/material";
import { GoogleSSOButton } from "../components/GoogleSSOButton";
import { SignUpButton } from "../components/SignUpButton";
import { useState } from "react";
import { checkCredentials } from "../api/checkCredentials";
import { useNavigate } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../config/authURLS";
import { useAuth } from "../api/useAuth";
import { PasswordTextField } from "../../../shared/components/PasswordTextField";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuthenticated } = useAuth();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string }>({});

    const onSubmit = async () => {
        try {
            await checkCredentials({ email, password });
            setAuthenticated(true);
            navigate(PRODUCTS_ROUTE);
        } catch {
            setErrors({ new: "Email or password is incorrect" });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Sign in
            </Typography>

            <Stack spacing={2}>
                <GoogleSSOButton />

                <Divider>or</Divider>

                <TextField label="Email" size="small" type="email" fullWidth
                    value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }}
                    error={!!errors.new} helperText={errors.new}
                />
                <PasswordTextField
                    label="Password" size="small" fullWidth
                    value={password} onChange={e => { setPassword(e.target.value); setErrors({}); }}
                    error={!!errors.new} helperText={errors.new}
                />

                <Button variant="contained" onClick={() => onSubmit()}>
                    Login
                </Button>

                <SignUpButton />
            </Stack>
        </Container>
    );
}

import { Container, Typography, Button, TextField, Stack, Divider, InputAdornment, IconButton } from "@mui/material";
import { GoogleSSOButton } from "../components/GoogleSSOButton";
import { SignUpButton } from "../components/SignUpButton";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { checkCredentials } from "../api/checkCredentials";
import { useNavigate } from "react-router-dom";
import { PRODUCTS_ROUTE } from "../config/authURLS";
import { useAuth } from "../api/useAuth";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuthenticated } = useAuth();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string }>({});
    const [show, setShow] = useState({ current: false, new: false });

    //TODO move to shared
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

                <TextField label="Email" type="email" fullWidth
                    value={email} onChange={e => setEmail(e.target.value)}
                    error={!!errors.new} helperText={errors.new}
                />
                <TextField
                    label="Password" size="small" fullWidth
                    type={show.new ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    error={!!errors.new} helperText={errors.new}
                    slotProps={{ input: eyeAdornment("new") }}
                />

                <Button variant="contained" onClick={() => onSubmit()}>
                    Login
                </Button>

                <SignUpButton />
            </Stack>
        </Container>
    );
}

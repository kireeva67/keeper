import { Container, Button, TextField, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../config/authURLS";

export default function SignUpPage() {
    const navigate = useNavigate();
    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Stack spacing={2}>
                <TextField label="Email" type="email" fullWidth />
                <TextField label="Password" type="password" fullWidth />
                <TextField label="Confirm password" type="password" fullWidth />

                <Button variant="contained">
                    Create account
                </Button>

                <Button variant="text" onClick={() => navigate(LOGIN_ROUTE)}>
                    Already have an account? Sign in
                </Button>
            </Stack>
        </Container>
    );
}

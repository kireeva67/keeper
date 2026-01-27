import { Container, Typography, Button, TextField, Stack, Divider } from "@mui/material";
import { GoogleSSOButton } from "../components/GoogleSSOButton";
import { SignUpButton } from "../components/SignUpButton";

export default function LoginPage() {
    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Sign in
            </Typography>

            <Stack spacing={2}>
                <GoogleSSOButton />

                <Divider>or</Divider>

                <TextField label="Email" type="email" fullWidth />
                <TextField label="Password" type="password" fullWidth />

                <Button variant="contained" onClick={() => console.log("login")}>
                    Login
                </Button>

                <SignUpButton />
            </Stack>
        </Container>
    );
}

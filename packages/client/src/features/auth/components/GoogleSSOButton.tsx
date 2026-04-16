import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { GOOGLE_SSO_URL } from "../config/authURLS";

export function GoogleSSOButton() {
    return (
        <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => { window.location.href = GOOGLE_SSO_URL; }}
            sx={{ border: '1px solid', borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.secondary' } }}
        >
            Sign in with Google
        </Button>
    );
}
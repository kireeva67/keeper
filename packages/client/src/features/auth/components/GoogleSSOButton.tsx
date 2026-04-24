import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { GOOGLE_SSO_URL } from "../config/authURLS";

export function GoogleSSOButton() {
    return (
        <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => { window.location.href = GOOGLE_SSO_URL; }}
            sx={{ border: '1px solid #bdbdbd', color: 'text.primary', '&:hover': { borderColor: '#9e9e9e' } }}
        >
            Sign in with Google
        </Button>
    );
}
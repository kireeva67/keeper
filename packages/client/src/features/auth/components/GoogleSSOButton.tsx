import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { GOOGLE_SSO_URL } from "../config/authURLS";

export function GoogleSSOButton() {
    return (
        <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => { window.location.href = GOOGLE_SSO_URL; }}
        >
            Sign in with Google
        </Button>
    );
}
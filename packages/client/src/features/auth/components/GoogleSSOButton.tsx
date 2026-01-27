import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { GOOGLE_SSO_URL } from "../config/authURLS";

export function GoogleSSOButton() {
    const navigate = useNavigate();
    return (
        <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => navigate(GOOGLE_SSO_URL)}
        >
            Sign in with Google
        </Button>
    );
}
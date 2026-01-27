import { Button } from "@mui/material";
import { SIGN_UP_ROUTE } from "../config/authURLS";
import { useNavigate } from "react-router-dom";

export function SignUpButton() {
    const navigate = useNavigate();
    return (
        <Button
            variant="text"
            onClick={() => navigate(SIGN_UP_ROUTE)}
        >
            Don't have an account? Sign up
        </Button>
    );
}
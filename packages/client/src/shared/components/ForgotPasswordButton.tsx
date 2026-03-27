import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FORGOT_PASSWORD_ROUTE } from "../../features/auth/config/authURLS";
import type { FROM_STATE } from "../types/FromStateType";

export function ForgotPasswordButton({ from }: { from: FROM_STATE }) {
    const navigate = useNavigate();
    return (
        <Button
            variant="text"
            onClick={() => navigate(FORGOT_PASSWORD_ROUTE, { state: { from } })}
        >
            Forgot password?
        </Button>
    );
}
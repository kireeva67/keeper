import { Avatar } from "@mui/material";
import { useUser } from "../api/useUser";

export function UserAvatar() {
    const { email } = useUser();
    return (
        <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            {email[0]?.toUpperCase()}
        </Avatar>
    );
}

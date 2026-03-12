import { useEffect, useState } from "react";
import { getUser } from "./getUser";
import { http } from "./http";

export function useUser() {
    const [email, setEmail] = useState<string>("");
    const [hasPassword, setHasPassword] = useState<boolean>(false);

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const user = await getUser();
                setHasPassword(user.hasPassword);
                setEmail(user.email);
            } catch (error) {
                console.error("Failed to fetch user email:", error);
            }
        };
        fetchEmail();
    }, []);

    const updatePassword = async (newPassword: string, currentPassword?: string) => {
        await http(`/api/me`, {
            method: "PUT",
            body: JSON.stringify({ newPassword, currentPassword }),
        });
        setHasPassword(true);
    };

    return { email, hasPassword, updatePassword };
}
import { useEffect, useState } from "react";
import { getUser } from "./getUser";
import { http } from "./http";

type LoadStatus = "loading" | "loaded" | "failed";

export function useUser() {
    const [email, setEmail] = useState<string>("");
    const [hasPassword, setHasPassword] = useState<boolean>(false);
    const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getUser();
                setHasPassword(user.hasPassword);
                setEmail(user.email);
                setLoadStatus("loaded");
            } catch {
                setLoadStatus("failed");
            }
        };
        loadUser();
    }, [loadAttempt]);

    const retryLoad = () => {
        setLoadStatus("loading");
        setLoadAttempt(attempt => attempt + 1);
    };

    const updatePassword = async (newPassword: string, currentPassword?: string) => {
        await http(`/api/me`, {
            method: "PUT",
            body: JSON.stringify({ newPassword, currentPassword }),
        });
        setHasPassword(true);
    };

    return { email, hasPassword, loadStatus, retryLoad, updatePassword };
}

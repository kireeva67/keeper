import { useCallback, useEffect, useState } from "react";
import { getUser } from "./getUser";
import { http } from "./http";

type LoadStatus = "loading" | "loaded" | "failed";

export function useUser() {
    const [email, setEmail] = useState<string>("");
    const [hasPassword, setHasPassword] = useState<boolean>(false);
    const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

    const loadUser = useCallback(async () => {
        setLoadStatus("loading");
        try {
            const user = await getUser();
            setHasPassword(user.hasPassword);
            setEmail(user.email);
            setLoadStatus("loaded");
        } catch {
            setLoadStatus("failed");
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const updatePassword = async (newPassword: string, currentPassword?: string) => {
        await http(`/api/me`, {
            method: "PUT",
            body: JSON.stringify({ newPassword, currentPassword }),
        });
        setHasPassword(true);
    };

    return { email, hasPassword, loadStatus, retryLoad: loadUser, updatePassword };
}

import { useEffect, useState } from "react";
import { getUser } from "./getUser";

export function useUser() {
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const user = await getUser();

                setEmail(user.email);
            } catch (error) {
                console.error("Failed to fetch user email:", error);
            }
        };
        fetchEmail();
    }, []);

    return { email };
}
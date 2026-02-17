import { HttpError } from "../errors/HTTPError";

export const API_URL = import.meta.env.VITE_API_URL;
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
    onUnauthorized = handler;
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (res.status === 401 && onUnauthorized) {
        onUnauthorized();
        throw new HttpError(401);
    }
    if (!res.ok) throw new HttpError(res.status); //TODO add check that link is not unique!!!
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

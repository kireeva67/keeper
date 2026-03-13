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
        return new Promise<T>(() => { });
    }
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new HttpError(res.status, body?.message);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

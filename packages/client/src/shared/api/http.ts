import { HttpError } from "../errors/HTTPError";

export const API_URL = import.meta.env.VITE_API_URL;

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) throw new HttpError(res.status);
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

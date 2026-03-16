export function validatePassword(password: string): string | null {
    if (password.length < 8) return "At least 8 characters";
    if (!/\d/.test(password)) return "Must contain a number";
    if (!/[!@#$%^&*()_+\-={}[\];':"\\|,.<>?]/.test(password)) return "Must contain a special character";
    return null;
}
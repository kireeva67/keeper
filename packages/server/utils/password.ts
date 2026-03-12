import bcrypt from "bcrypt";

export function validateNewPassword(newPassword: string): string | null {
    if (newPassword.length < 8) return "Password must be at least 8 characters";
    if (!/\d/.test(newPassword)) return "Password must contain a number";
    if (!/[!@#$%^&*()_+\-={}[\];':"\\|,.<>?]/.test(newPassword)) return "Password must contain a special character";
    return null;
}

export async function verifyCurrentPassword(
    currentHash: string | null,
    currentPassword: string | undefined
): Promise<string | null> {
    if (currentHash && !currentPassword) return "Current password required";
    if (currentHash && currentPassword) {
        const valid = await bcrypt.compare(currentPassword, currentHash);
        if (!valid) return "Current password is incorrect";
    }
    return null;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

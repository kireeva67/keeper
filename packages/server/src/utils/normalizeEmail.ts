// Emails are case-insensitive for our purposes; Google sign-in already lowercases.
export function normalizeEmail(email: string): string {
    return typeof email === 'string' ? email.trim().toLowerCase() : email;
}

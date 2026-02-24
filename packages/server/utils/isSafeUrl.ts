const BLOCKED_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254',
    '::1',
];

const PRIVATE_IP_RANGES = [
    /^10\./,                          // 10.0.0.0 - 10.255.255.255
    /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16.0.0 - 172.31.255.255
    /^192\.168\./,                    // 192.168.0.0 - 192.168.255.255
    /^127\./,                         // Loopback (Optional but recommended)
    /^localhost$/                     // Localhost (Optional but recommended)
];

export function isSafeUrl(raw: string): boolean {
    try {
        const { protocol, hostname } = new URL(raw);
        const lowerHostname = hostname.toLowerCase();

        // 1. Protocol Guard
        if (!['http:', 'https:'].includes(protocol)) return false;

        // 2. Exact Match Blocklist
        if (BLOCKED_HOSTNAMES.includes(lowerHostname)) return false;

        // 3. Pattern Match Blocklist (Private IPs)
        const isPrivate = PRIVATE_IP_RANGES.some(regex => regex.test(lowerHostname));
        if (isPrivate) return false;

        return true;
    } catch {
        return false;
    }
}

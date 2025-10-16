// Helper function to anonymize IPs (IPv4)
export function anonymizeIp(ip: string): string {
    if (ip.includes('.')) {
        const parts = ip.split('.');
        parts[3] = '0'; // anonymize last octet
        return parts.join('.');
    }
    // IPv6
    if (ip.includes(':')) {
        const parts = ip.split(':');
        parts[parts.length - 1] = '0000';
        return parts.join(':');
    }
    return ip;
}
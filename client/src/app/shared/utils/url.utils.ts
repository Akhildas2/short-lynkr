export function isShortUrl(url: string): boolean {
    const shortlength = 35;
    return url.length <= shortlength;
}
export function isShortUrl(url: string): boolean {
    const shortlength = 35;
    return url.length <= shortlength;
}


export function openInNewTab(url: string): void {
  window.open(url, '_blank');
}


export function extractShortId(url: string): string | null {
  const match = url.match(/\/r\/([\w-]+)/);
  return match ? match[1] : null;
}
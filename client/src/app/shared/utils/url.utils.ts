export function isShortUrl(url: string): boolean {
  const shortlength = 35;
  return url.length <= shortlength;
}


export function openUrl(url: string, newTab: boolean = true): void {
  if (newTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}
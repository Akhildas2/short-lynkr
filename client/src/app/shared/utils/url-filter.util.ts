import { UrlEntry } from "../../models/url/url.model";

export function filterUrls(
  urls: UrlEntry[],
  searchTerm: string,
  statusFilter: '' | 'active' | 'blocked'
): UrlEntry[] {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    // No search term → only filter by status
    return urls.filter(url =>
      !statusFilter ||
      (statusFilter === 'active' && !url.isBlocked) ||
      (statusFilter === 'blocked' && url.isBlocked)
    );
  }

  return urls.filter(url => {
    const matchesSearch =
      url.shortUrl.toLowerCase().includes(term) ||
      url.originalUrl.toLowerCase().includes(term) ||
      (Array.isArray(url.tags) && url.tags.some(tag => tag.toLowerCase().includes(term)));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && !url.isBlocked) ||
      (statusFilter === 'blocked' && url.isBlocked);

    return matchesSearch && matchesStatus;
  });
}
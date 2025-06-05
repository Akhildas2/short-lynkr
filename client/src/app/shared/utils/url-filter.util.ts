import { UrlEntry } from "../../models/url/url.model";

export function filterUrls(
  urls: UrlEntry[],
  searchTerm: string,
  statusFilter: '' | 'active' | 'inactive'
): UrlEntry[] {
  const term = searchTerm.toLowerCase().trim();

  return urls.filter(url => {
    const matchesSearch =
      url.shortUrl.toLowerCase().includes(term) ||
      url.originalUrl.toLowerCase().includes(term) ||
      (Array.isArray(url.tags) && url.tags.some((tag: string) => tag.toLowerCase().includes(term)));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && url.isActive) ||
      (statusFilter === 'inactive' && !url.isActive);

    return matchesSearch && matchesStatus;
  });
}

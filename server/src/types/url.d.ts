export interface UrlEntry {
  shortId: string;
  originalUrl: string;
  createdAt: Date;
  clicks: number;
}

export interface ShortenUrlRequest {
  url: string;
}
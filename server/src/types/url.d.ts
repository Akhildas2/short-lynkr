export interface UrlEntry {
  shortId: string;
  originalUrl: string;
  createdAt: Date;
  clicks: number;
}

export interface ShortenUrlRequest {
  url: string;
}

export interface UrlResponse {
  shortUrl: string;
  originalUrl: string;
  clicks: number;
}

export interface ErrorResponse {
  error: {
    message: string;
    status: number;
    timestamp: string;
  };
}
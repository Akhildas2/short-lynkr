export interface SocialQrEntry {
    _id: string;
    platform: string;
    accountUrl: string;
    size: number;
    format: 'PNG' | 'JPEG' | 'SVG';
    foregroundColor: string;
    backgroundColor: string;
    qrCodeUrl?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
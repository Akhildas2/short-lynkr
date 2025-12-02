export interface SocialQrEntry {
    _id: string;
    platform: string;
    accountUrl: string;
    qrCodeUrl: string;
    format: 'PNG' | 'JPEG' | 'SVG';
    size: number;
    foregroundColor: string;
    backgroundColor: string;
    createdAt: string;
    updatedAt: string;
}

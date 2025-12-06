import QRCode from 'qrcode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface GenerateQrOptions {
    url: string;
    size?: number;
    format?: 'PNG' | 'JPEG' | 'SVG';
    foregroundColor?: string;
    backgroundColor?: string;
    sanitizer?: DomSanitizer; // required for SVG in Angular
}

export interface GenerateQrResult {
    qrPreview: string | SafeHtml;
    qrRaw: string;
}

/**
 * Generates QR code with optional SVG or image output.
 */
export async function generateQr({
    url,
    size = 300,
    format = 'PNG',
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    sanitizer
}: GenerateQrOptions): Promise<GenerateQrResult> {
    if (!url) throw new Error('QR URL is required');

    const opts: QRCode.QRCodeToDataURLOptions = {
        width: size,
        margin: 2,
        color: { dark: foregroundColor, light: backgroundColor }
    };

    if (format === 'SVG') {
        const svgString = await QRCode.toString(url, { ...opts, type: 'svg' });
        const qrPreview = sanitizer ? sanitizer.bypassSecurityTrustHtml(svgString) : svgString;
        return { qrPreview, qrRaw: svgString };
    } else {
        const dataUrl = await QRCode.toDataURL(url, opts);
        return { qrPreview: dataUrl, qrRaw: dataUrl };
    }
}
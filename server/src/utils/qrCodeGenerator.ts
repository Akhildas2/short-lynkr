import QRCode from 'qrcode';

interface QrOptions {
    size?: number;
    format?: 'PNG' | 'JPEG' | 'SVG';
    foregroundColor?: string;
    backgroundColor?: string;
}

/**
 * Generates a QR code as a base64 data URL.
 */
export const generateQRCode = async (data: string, options?: QrOptions): Promise<string> => {
    const {
        size = 300,
        format = 'PNG',
        foregroundColor = '#000000',
        backgroundColor = '#ffffff'
    } = options || {};

    // Generate SVG QR code
    if (format === 'SVG') {
        const svgString = await QRCode.toString(data, {
            type: 'svg',
            width: size,
            color: {
                dark: foregroundColor,
                light: backgroundColor
            }
        });

        // Convert SVG string to base64 data URL for embedding
        const base64Svg = Buffer.from(svgString).toString('base64');
        return `data:image/svg+xml;base64,${base64Svg}`;
    }
    else {
        // Generate PNG or JPEG QR code
        const type = format === 'JPEG' ? 'image/jpeg' : 'image/png';
        return await QRCode.toDataURL(data, {
            width: size,
            type,
            color: {
                dark: foregroundColor,
                light: backgroundColor
            }
        });
    }
};

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const colorContrastValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const fg = control.get('foregroundColor')?.value;
    const bg = control.get('backgroundColor')?.value;

    if (!fg || !bg) return null;

    const fgNorm = fg.trim().toUpperCase();
    const bgNorm = bg.trim().toUpperCase();

    // Exact match → never allowed
    if (fgNorm === bgNorm) {
        return { sameColor: true };
    }

    // Convert from hex to R,G,B
    const hexToRgb = (hex: string) => {
        const cleanHex = hex.replace('#', '');
        const num = parseInt(cleanHex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    };

    // Relative luminance
    const luminance = (r: number, g: number, b: number) => {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const fgRgb = hexToRgb(fgNorm);
    const bgRgb = hexToRgb(bgNorm);

    const L1 = luminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const L2 = luminance(bgRgb.r, bgRgb.g, bgRgb.b);

    const contrast =
        L1 > L2 ? (L1 + 0.05) / (L2 + 0.05) : (L2 + 0.05) / (L1 + 0.05);

    // QR code scanning requires very high contrast (> 2.5)
    if (contrast < 2.5) {
        return { lowContrast: true, contrastValue: contrast };
    }

    return null;
};
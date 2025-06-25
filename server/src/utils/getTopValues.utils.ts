export function getTopValues(data: any[], key: string) {
    const normalize = (value: string | undefined): string => {
        const val = (value || 'Unknown').toLowerCase();

        if (key === 'device') {
            if (val.includes('mobile')) return 'Mobile';
            if (val.includes('tablet')) return 'Tablet';
            if (val.includes('desktop') || val.includes('windows') || val.includes('mac') || val.includes('linux')) return 'Desktop';
            return 'Unknown';
        }

        if (key === 'browser') {
            if (val.includes('chrome')) return 'Chrome';
            if (val.includes('firefox')) return 'Firefox';
            if (val.includes('safari') && !val.includes('chrome')) return 'Safari';
            if (val.includes('edge')) return 'Edge';
            if (val.includes('opera')) return 'Opera';
            return 'Other';
        }

        if (key === 'os') {
            if (val.includes('windows')) return 'Windows';
            if (val.includes('android')) return 'Android';
            if (val.includes('ios')) return 'iOS';
            if (val.includes('mac')) return 'macOS';
            if (val.includes('linux')) return 'Linux';
            return 'Other';
        }

        if (key === 'referrer') {
            if (val === '' || val === 'direct') return 'Direct';
            if (val.includes('google')) return 'Google';
            if (val.includes('facebook')) return 'Facebook';
            if (val.includes('twitter')) return 'Twitter';
            if (val.includes('instagram')) return 'Instagram';
            if (val.includes('linkedin')) return 'LinkedIn';
            return 'Other';
        }

        // For all other unknown keys, return raw value formatted nicely
        return value ? value.trim() || 'Unknown' : 'Unknown';
    };

    // Count normalized values
    const countMap = data.reduce((acc: Record<string, number>, item) => {
        const normalized = normalize(item[key]);
        acc[normalized] = (acc[normalized] || 0) + 1;
        return acc;
    }, {});

    const total = Object.values(countMap).reduce((sum, val) => sum + val, 0);
    return Object.entries(countMap)
        .map(([name, value]) => {
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return {
                name,
                value,
                percentage: parseFloat(percentage),
            };
        })
        .sort((a, b) => b.value - a.value);

}

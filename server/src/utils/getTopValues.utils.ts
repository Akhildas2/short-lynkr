export function getTopValues(data: any[], key: string) {
    const normalize = (value: string): string => {

        const val = (value || 'Unknown').toLowerCase();
        switch (key) {
            case 'device':
                if (val.includes('mobile')) return 'Mobile';
                if (val.includes('tablet')) return 'Tablet';
                if (val.includes('desktop')) return 'Desktop';
                break;
            case 'browser':
                if (val.includes('chrome')) return 'Chrome';
                if (val.includes('firefox')) return 'Firefox';
                if (val.includes('safari') && !val.includes('chrome')) return 'Safari';
                if (val.includes('edge')) return 'Edge';
                if (val.includes('opera')) return 'Opera';
                break;
            case 'os':
                if (val.includes('windows')) return 'Windows';
                if (val.includes('android')) return 'Android';
                if (val.includes('ios')) return 'iOS';
                if (val.includes('mac')) return 'macOS';
                if (val.includes('linux')) return 'Linux';
                break;
            case 'referrer':
                if (val === '' || val === 'direct') return 'Direct';
                if (val.includes('google')) return 'Google';
                if (val.includes('facebook')) return 'Facebook';
                if (val.includes('twitter')) return 'Twitter';
                if (val.includes('instagram')) return 'Instagram';
                if (val.includes('linkedin')) return 'LinkedIn';
                break;
        }

        return val.charAt(0).toLowerCase() + val.slice(1);
    }

    const countMap = data.reduce((acc: Record<string, number>, item) => {
        const normalized = normalize(item[key]);
        acc[normalized] = (acc[normalized] || 0) + 1;
        return acc;
    }, {});

    const total = Object.values(countMap).reduce((sum, val) => sum + val, 0);
    return Object.entries(countMap).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100)
    }));
}
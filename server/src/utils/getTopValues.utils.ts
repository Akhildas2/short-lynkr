export function getTopValues(data: any[], key: string) {
    const countMap = data.reduce((acc: Record<string, number>, item) => {
        const value = item[key] || 'Unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    const total = Object.values(countMap).reduce((sum, val) => sum + val, 0);
    return Object.entries(countMap).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100)
    }));
}
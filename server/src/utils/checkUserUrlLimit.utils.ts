import UrlModel from '../models/url.model';
import { ApiError } from './ApiError';

export const checkUserUrlLimit = async (
    userId: string,
    limit: number,
    period: 'daily' | 'monthly' | 'total' = 'total'
) => {
    let start: Date | undefined;
    let end: Date | undefined;
    const now = new Date();

    if (period === 'daily') {
        start = new Date(now); start.setHours(0, 0, 0, 0);
        end = new Date(now); end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
        start = new Date(now); start.setMonth(start.getMonth() - 1); start.setHours(0, 0, 0, 0);
        end = now;
    }

    const query: any = { userId };
    if (start && end) query.createdAt = { $gte: start, $lte: end };

    const count = await UrlModel.countDocuments(query);

    if (count >= limit) {
        const periodText = period === 'total' ? 'maximum allowed URLs' : `${period} URL creation limit`;
        throw new ApiError(`You have reached your ${periodText} of ${limit}.`, 400);
    }
};

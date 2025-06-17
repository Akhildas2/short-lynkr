import cron from 'node-cron';
import urlModel from '../models/url.model';


(async () => {

    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            await urlModel.updateMany(
                {
                    isActive: true,
                    $or: [
                        { expiresAt: { $lte: now } },
                        {
                            $expr: {
                                $and: [
                                    { $gt: ['$clickLimit', 0] },
                                    { $gte: ['$clicks', '$clickLimit'] }
                                ]
                            }
                        }
                    ]
                },
                { $set: { isActive: false } }
            );
        } catch (error) {
            throw new Error(`URL cleanup cron job failed: ${(error as Error).message}`);
        }
    });
    
})();
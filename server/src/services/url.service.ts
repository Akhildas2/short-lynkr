import { db } from '../config/firebase';
import { generateShortId } from '../utils/shortIdGenerator';
import { UrlEntry } from '../types/url.d';
import * as admin from 'firebase-admin';

export class UrlService {
    static async createShortUrl(originalUrl: string): Promise<UrlEntry> {
        const shortId = generateShortId();
        const urlEntry: UrlEntry = {
            shortId,
            originalUrl,
            createdAt: new Date(),
            clicks: 0
        };

        await db.collection('urls').doc(shortId).set(urlEntry);
        return urlEntry;
    }

    static async getOriginalUrl(shortId: string): Promise<string> {
        const doc = await db.collection('urls').doc(shortId).get();
        if (!doc.exists) throw new Error('URL not found');

        await doc.ref.update({ clicks: admin.firestore.FieldValue.increment(1) });
        return doc.data()?.originalUrl;
    }
}
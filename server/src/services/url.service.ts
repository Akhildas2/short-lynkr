import { db } from '../config/firebase';
import { generateShortId } from '../utils/shortIdGenerator';
import { UrlEntry } from '../types/url.d';
import * as admin from 'firebase-admin';

export class UrlService {
    // services/url.service.ts
    static async createShortUrl(originalUrl: string): Promise<UrlEntry> {
        let shortId: string = '';
        let docExists = true;
        let attempts = 0;

        while (docExists && attempts < 5) {
            shortId = generateShortId();
            const doc = await db.collection('urls').doc(shortId).get();
            docExists = doc.exists;
            attempts++;
        }

        if (docExists) {
            throw new Error('Failed to generate a unique short ID');
        }

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
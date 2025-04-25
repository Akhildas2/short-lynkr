import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS in environment');
}

// Parse the service account JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
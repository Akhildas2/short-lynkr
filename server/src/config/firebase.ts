import * as admin from 'firebase-admin';
import { getConfig } from './env';

const config = getConfig();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: config.firebase.databaseURL
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
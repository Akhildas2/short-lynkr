import * as functions from 'firebase-functions';
import { config } from 'dotenv-safe';

config();

export const getConfig = () => ({
  env: process.env.NODE_ENV || 'development',
  firebase: {
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || ''
  },
  baseUrl: process.env.BASE_URL || functions.config().base_url
});
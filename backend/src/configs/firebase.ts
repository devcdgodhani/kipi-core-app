import * as admin from 'firebase-admin';
import { ENV_VARIABLE } from './env';

try {
  if (ENV_VARIABLE.FIREBASE_PROJECT_ID && ENV_VARIABLE.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: ENV_VARIABLE.FIREBASE_PROJECT_ID,
        clientEmail: ENV_VARIABLE.FIREBASE_CLIENT_EMAIL,
        privateKey: ENV_VARIABLE.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase credentials not found. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export const messaging = admin.messaging ? admin.messaging() : {
  sendEachForMulticast: async () => ({ successCount: 0, failureCount: 0, responses: [] }),
} as any;

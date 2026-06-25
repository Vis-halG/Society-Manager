import {
  arrayUnion,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { NotificationType } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function notificationsQuery(userId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { isRead: true });
}

export async function notifyUsers(
  userIds: string[],
  payload: {
    societyId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) {
  if (userIds.length === 0) return;
  const batch = writeBatch(db);
  userIds.forEach((userId) => {
    const ref = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    batch.set(ref, {
      userId,
      societyId: payload.societyId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      isRead: false,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

function getExpoProjectId(): string | undefined {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  return typeof projectId === 'string' &&
    projectId.trim().length > 0 &&
    projectId !== 'YOUR_EAS_PROJECT_ID'
    ? projectId
    : undefined;
}

export async function registerForPushNotificationsAsync(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = getExpoProjectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenResponse.data;

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    fcmTokens: arrayUnion(token),
  });

  return token;
}

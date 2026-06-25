import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { ChatMessage, ChatRoom } from '../types';

export function chatRoomsQuery(userId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.CHAT_ROOMS),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
}

export async function createChatRoom(input: {
  societyId: string;
  type: ChatRoom['type'];
  participantIds: string[];
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_ROOMS), {
    ...input,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCount: {},
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function findOrCreateDirectChatRoom(
  societyId: string,
  userIdA: string,
  userIdB: string
): Promise<string> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.CHAT_ROOMS),
      where('societyId', '==', societyId),
      where('type', '==', 'direct'),
      where('participantIds', 'array-contains', userIdA)
    )
  );
  const existing = snap.docs.find((d) => {
    const data = d.data() as ChatRoom;
    return data.participantIds.includes(userIdB);
  });
  if (existing) return existing.id;
  return createChatRoom({ societyId, type: 'direct', participantIds: [userIdA, userIdB] });
}

export function messagesQuery(chatRoomId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.MESSAGES),
    where('chatRoomId', '==', chatRoomId),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
}

export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  return onSnapshot(messagesQuery(chatRoomId), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
  });
}

export async function sendMessage(input: {
  chatRoomId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
}) {
  const batch = writeBatch(db);
  const messageRef = doc(collection(db, COLLECTIONS.MESSAGES));
  batch.set(messageRef, {
    chatRoomId: input.chatRoomId,
    senderId: input.senderId,
    senderName: input.senderName,
    text: input.text ?? '',
    imageUrl: input.imageUrl ?? null,
    readBy: [input.senderId],
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, COLLECTIONS.CHAT_ROOMS, input.chatRoomId), {
    lastMessage: input.text || (input.imageUrl ? '📷 Image' : ''),
    lastMessageAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function markMessagesRead(messageIds: string[], userId: string) {
  const batch = writeBatch(db);
  messageIds.forEach((id) => {
    batch.update(doc(db, COLLECTIONS.MESSAGES, id), { readBy: arrayUnion(userId) });
  });
  if (messageIds.length) await batch.commit();
}

export async function setUserOnlineStatus(userId: string, isOnline: boolean) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    isOnline,
    lastSeen: serverTimestamp(),
  });
}

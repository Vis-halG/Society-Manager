import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { listAllUsersBySociety } from './users.service';
import { notifyUsers } from './notifications.service';
import type { Attachment, Notice } from '../types';

export function noticesQuery(societyId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.NOTICES),
    where('societyId', '==', societyId),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

export async function createNotice(input: {
  societyId: string;
  title: string;
  description: string;
  category: Notice['category'];
  isPinned: boolean;
  attachments: Attachment[];
  createdBy: string;
  createdByName: string;
}) {
  await addDoc(collection(db, COLLECTIONS.NOTICES), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: null,
  });

  const residents = await listAllUsersBySociety(input.societyId);
  const residentIds = residents
    .filter((u) => u.role === 'resident' && u.approvalStatus === 'approved')
    .map((u) => u.id);
  await notifyUsers(residentIds, {
    societyId: input.societyId,
    type: 'notice',
    title: 'New Notice',
    body: input.title,
  });
}

export async function updateNotice(
  noticeId: string,
  data: Partial<Pick<Notice, 'title' | 'description' | 'category' | 'isPinned' | 'attachments'>>
) {
  await updateDoc(doc(db, COLLECTIONS.NOTICES, noticeId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNotice(noticeId: string) {
  await deleteDoc(doc(db, COLLECTIONS.NOTICES, noticeId));
}

export async function togglePin(noticeId: string, isPinned: boolean) {
  await updateDoc(doc(db, COLLECTIONS.NOTICES, noticeId), {
    isPinned,
    updatedAt: serverTimestamp(),
  });
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { DocumentCategory } from '../types';

export function documentsQuery(societyId: string, category?: DocumentCategory): Query<DocumentData> {
  const constraints = [where('societyId', '==', societyId)];
  if (category) constraints.push(where('category', '==', category));
  return query(collection(db, COLLECTIONS.DOCUMENTS), ...constraints, orderBy('createdAt', 'desc'));
}

export async function uploadDocument(input: {
  societyId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  sizeBytes: number;
  uploadedBy: string;
}) {
  await addDoc(collection(db, COLLECTIONS.DOCUMENTS), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteDocument(documentId: string) {
  await deleteDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId));
}

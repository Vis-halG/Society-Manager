import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { Society } from '../types';

export async function listSocieties(): Promise<Society[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.SOCIETIES), orderBy('name'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Society);
}

export async function createSociety(input: {
  name: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  totalWings: number;
  totalFlats: number;
  createdBy: string;
}) {
  return addDoc(collection(db, COLLECTIONS.SOCIETIES), {
    ...input,
    adminIds: [],
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSociety(societyId: string, data: Partial<Society>) {
  await updateDoc(doc(db, COLLECTIONS.SOCIETIES, societyId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSociety(societyId: string) {
  await deleteDoc(doc(db, COLLECTIONS.SOCIETIES, societyId));
}

export async function addAdminToSociety(societyId: string, userId: string) {
  await updateDoc(doc(db, COLLECTIONS.SOCIETIES, societyId), {
    adminIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    role: 'admin',
    societyId,
    approvalStatus: 'approved',
    updatedAt: serverTimestamp(),
  });
}

export async function removeAdminFromSociety(societyId: string, userId: string) {
  await updateDoc(doc(db, COLLECTIONS.SOCIETIES, societyId), {
    adminIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    role: 'resident',
    updatedAt: serverTimestamp(),
  });
}

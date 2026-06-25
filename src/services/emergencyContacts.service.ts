import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';

export function emergencyContactsQuery(societyId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.EMERGENCY_CONTACTS),
    where('societyId', '==', societyId),
    orderBy('label', 'asc')
  );
}

export async function addEmergencyContact(input: {
  societyId: string;
  label: string;
  name: string;
  phone: string;
  icon: string;
}) {
  await addDoc(collection(db, COLLECTIONS.EMERGENCY_CONTACTS), input);
}

export async function deleteEmergencyContact(contactId: string) {
  await deleteDoc(doc(db, COLLECTIONS.EMERGENCY_CONTACTS, contactId));
}

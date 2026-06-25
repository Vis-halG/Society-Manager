import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { notifyUsers } from './notifications.service';
import type { Visitor } from '../types';

export function visitorsQuery(societyId: string, hostUserId?: string): Query<DocumentData> {
  const constraints = [where('societyId', '==', societyId)];
  if (hostUserId) constraints.push(where('hostUserId', '==', hostUserId));
  return query(collection(db, COLLECTIONS.VISITORS), ...constraints, orderBy('createdAt', 'desc'));
}

export async function createVisitor(input: {
  societyId: string;
  hostUserId: string;
  hostFlatNumber: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  preApproved: boolean;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.VISITORS), {
    ...input,
    qrCode: '',
    status: input.preApproved ? 'approved' : 'pending',
    entryTime: null,
    exitTime: null,
    verifiedBy: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(docRef, { qrCode: docRef.id });
  return docRef.id;
}

export async function setVisitorApproval(visitorId: string, approved: boolean) {
  await updateDoc(doc(db, COLLECTIONS.VISITORS, visitorId), {
    status: approved ? 'approved' : 'rejected',
  });
}

export async function checkInVisitor(visitor: Visitor, verifiedBy: string) {
  await updateDoc(doc(db, COLLECTIONS.VISITORS, visitor.id), {
    status: 'checked_in',
    entryTime: serverTimestamp(),
    verifiedBy,
  });

  await notifyUsers([visitor.hostUserId], {
    societyId: visitor.societyId,
    type: 'visitor',
    title: 'Visitor Arrived',
    body: `${visitor.visitorName} has checked in at the gate.`,
    data: { visitorId: visitor.id },
  });
}

export async function checkOutVisitor(visitorId: string) {
  await updateDoc(doc(db, COLLECTIONS.VISITORS, visitorId), {
    status: 'checked_out',
    exitTime: serverTimestamp(),
  });
}

export async function getVisitorById(visitorId: string): Promise<Visitor | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.VISITORS, visitorId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Visitor) : null;
}

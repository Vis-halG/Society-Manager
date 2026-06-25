import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  updateDoc,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, COMPLAINT_STATUS_LABELS } from '../constants';
import { notifyUsers } from './notifications.service';
import type { Attachment, Complaint, ComplaintStatus } from '../types';

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string | null;
  createdAt: import('firebase/firestore').Timestamp;
}

export function complaintsQuery(societyId: string, residentId?: string): Query<DocumentData> {
  const constraints = [where('societyId', '==', societyId)];
  if (residentId) constraints.push(where('raisedBy', '==', residentId));
  return query(collection(db, COLLECTIONS.COMPLAINTS), ...constraints, orderBy('createdAt', 'desc'));
}

export async function createComplaint(input: {
  societyId: string;
  raisedBy: string;
  raisedByName: string;
  flatNumber?: string;
  category: Complaint['category'];
  title: string;
  description: string;
  images: Attachment[];
}) {
  const docRef = await addDoc(collection(db, COLLECTIONS.COMPLAINTS), {
    ...input,
    status: 'open' satisfies ComplaintStatus,
    assignedTo: null,
    assignedToName: null,
    remarks: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
  });
  return docRef.id;
}

export async function updateComplaintStatus(
  complaint: Complaint,
  status: ComplaintStatus,
  remarks?: string
) {
  await updateDoc(doc(db, COLLECTIONS.COMPLAINTS, complaint.id), {
    status,
    ...(remarks !== undefined ? { remarks } : {}),
    ...(status === 'resolved' ? { resolvedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });

  await notifyUsers([complaint.raisedBy], {
    societyId: complaint.societyId,
    type: 'complaint',
    title: 'Complaint Update',
    body: `"${complaint.title}" is now ${COMPLAINT_STATUS_LABELS[status]}`,
    data: { complaintId: complaint.id },
  });
}

export async function assignComplaint(
  complaintId: string,
  assignedTo: string,
  assignedToName: string
) {
  await updateDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId), {
    assignedTo,
    assignedToName,
    status: 'assigned' satisfies ComplaintStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function getComplaint(complaintId: string): Promise<Complaint | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Complaint) : null;
}

export function complaintMessagesQuery(complaintId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.COMPLAINT_MESSAGES),
    where('complaintId', '==', complaintId),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
}

export async function sendComplaintMessage(input: {
  complaintId: string;
  senderId: string;
  senderName: string;
  text: string;
}) {
  await addDoc(collection(db, COLLECTIONS.COMPLAINT_MESSAGES), {
    ...input,
    imageUrl: null,
    createdAt: serverTimestamp(),
  });
}

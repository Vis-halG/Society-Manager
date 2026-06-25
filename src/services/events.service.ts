import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { SocietyEvent } from '../types';

export function eventsQuery(societyId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.EVENTS),
    where('societyId', '==', societyId),
    orderBy('startAt', 'desc')
  );
}

export async function createEvent(input: {
  societyId: string;
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
  bannerUrl?: string | null;
  createdBy: string;
}) {
  await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...input,
    bannerUrl: input.bannerUrl ?? null,
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),
    gallery: [],
    rsvps: {},
    createdAt: serverTimestamp(),
  });
}

export async function setRsvp(eventId: string, userId: string, status: 'going' | 'not_going' | 'maybe') {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    [`rsvps.${userId}`]: status,
  });
}

export async function addGalleryImage(eventId: string, url: string) {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    gallery: arrayUnion(url),
  });
}

export function rsvpCounts(event: SocietyEvent) {
  const values = Object.values(event.rsvps ?? {});
  return {
    going: values.filter((v) => v === 'going').length,
    maybe: values.filter((v) => v === 'maybe').length,
    notGoing: values.filter((v) => v === 'not_going').length,
  };
}

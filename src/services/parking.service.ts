import {
  addDoc,
  collection,
  doc,
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
import type { Vehicle } from '../types';

export function vehiclesQuery(societyId: string, ownerUserId?: string): Query<DocumentData> {
  const constraints = [where('societyId', '==', societyId)];
  if (ownerUserId) constraints.push(where('ownerUserId', '==', ownerUserId));
  return query(collection(db, COLLECTIONS.VEHICLES), ...constraints, orderBy('createdAt', 'desc'));
}

export async function registerVehicle(input: {
  societyId: string;
  ownerUserId: string;
  ownerName: string;
  vehicleNumber: string;
  vehicleType: Vehicle['vehicleType'];
}) {
  await addDoc(collection(db, COLLECTIONS.VEHICLES), {
    ...input,
    parkingSlotId: null,
    createdAt: serverTimestamp(),
  });
}

export function parkingSlotsQuery(societyId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.PARKING_SLOTS),
    where('societyId', '==', societyId),
    orderBy('slotNumber', 'asc')
  );
}

export async function createParkingSlot(input: {
  societyId: string;
  slotNumber: string;
  type: 'two_wheeler' | 'four_wheeler' | 'visitor';
}) {
  await addDoc(collection(db, COLLECTIONS.PARKING_SLOTS), {
    ...input,
    isAllocated: false,
    allocatedTo: null,
    vehicleId: null,
  });
}

export async function allocateSlot(slotId: string, vehicleId: string, ownerUserId: string) {
  await updateDoc(doc(db, COLLECTIONS.PARKING_SLOTS, slotId), {
    isAllocated: true,
    allocatedTo: ownerUserId,
    vehicleId,
  });
  await updateDoc(doc(db, COLLECTIONS.VEHICLES, vehicleId), {
    parkingSlotId: slotId,
  });
}

export async function deallocateSlot(slotId: string, vehicleId: string) {
  await updateDoc(doc(db, COLLECTIONS.PARKING_SLOTS, slotId), {
    isAllocated: false,
    allocatedTo: null,
    vehicleId: null,
  });
  await updateDoc(doc(db, COLLECTIONS.VEHICLES, vehicleId), {
    parkingSlotId: null,
  });
}

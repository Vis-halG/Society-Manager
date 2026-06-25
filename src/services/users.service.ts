import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { AppUser, FamilyMember } from '../types';

export async function updateProfile(
  userId: string,
  data: Partial<Pick<AppUser, 'fullName' | 'mobileNumber' | 'flatNumber' | 'wing' | 'profileImageUrl'>>
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function setFamilyMembers(userId: string, members: FamilyMember[]) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    familyMembers: members,
    updatedAt: serverTimestamp(),
  });
}

export async function listPendingResidents(societyId: string): Promise<AppUser[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.USERS),
      where('societyId', '==', societyId),
      where('approvalStatus', '==', 'pending')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
}

export async function setApprovalStatus(
  userId: string,
  status: 'approved' | 'rejected'
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    approvalStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserRole(userId: string, role: 'resident' | 'security') {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function getSocietyAdmins(societyId: string): Promise<AppUser[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.USERS),
      where('societyId', '==', societyId),
      where('role', '==', 'admin')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
}

export async function listAllUsersBySociety(societyId: string): Promise<AppUser[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.USERS), where('societyId', '==', societyId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
}

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { AppUser } from '../types';

export function useUserProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, COLLECTIONS.USERS, userId), (snap) => {
      setProfile(snap.exists() ? ({ id: snap.id, ...snap.data() } as AppUser) : null);
    });
    return unsubscribe;
  }, [userId]);

  return profile;
}

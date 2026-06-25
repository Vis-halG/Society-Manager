import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { AppUser, UserRole } from '../types';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  flatNumber: string;
  wing: string;
  societyId: string;
}

export interface CompleteProfileInput {
  fullName: string;
  mobileNumber: string;
  flatNumber: string;
  wing: string;
  societyId: string;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  completeProfile: (input: CompleteProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setInitializing(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setUser({ id: snap.id, ...snap.data() } as AppUser);
        } else {
          setUser(null);
        }
        setInitializing(false);
      },
      () => setInitializing(false)
    );
    return unsubscribe;
  }, [firebaseUser]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const buildResidentProfile = (
    input: CompleteProfileInput,
    email: string,
    emailVerified: boolean
  ): Omit<AppUser, 'id'> => ({
    fullName: input.fullName,
    email,
    mobileNumber: input.mobileNumber,
    role: 'resident',
    societyId: input.societyId || null,
    flatNumber: input.flatNumber,
    wing: input.wing,
    profileImageUrl: null,
    approvalStatus: 'pending',
    emailVerified,
    familyMembers: [],
    fcmTokens: [],
    isOnline: true,
    lastSeen: serverTimestamp() as never,
    createdAt: serverTimestamp() as never,
    updatedAt: serverTimestamp() as never,
  });

  const register = async (input: RegisterInput) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password
    );
    const newUser = buildResidentProfile(input, input.email, false);
    await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), newUser);
    await sendEmailVerification(credential.user);
  };

  const completeProfile = async (input: CompleteProfileInput) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      throw new Error('You must be signed in before completing your profile.');
    }
    const newUser = buildResidentProfile(
      input,
      currentUser.email,
      currentUser.emailVerified
    );
    await setDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), newUser);
  };

  const logout = async () => {
    if (firebaseUser) {
      await updateDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch(() => undefined);
    }
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
    if (snap.exists()) {
      setUser({ id: snap.id, ...snap.data() } as AppUser);
    }
  };

  const hasRole = (...roles: UserRole[]) =>
    !!user?.role && roles.includes(user.role);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      initializing,
      login,
      signInWithGoogle,
      register,
      completeProfile,
      logout,
      resetPassword,
      resendVerificationEmail,
      changePassword,
      refreshUser,
      hasRole,
    }),
    [firebaseUser, user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import type { Payment } from '../types';

export interface ResidentDashboardStats {
  totalNotices: number;
  pendingComplaints: number;
  upcomingEvents: number;
  unpaidBills: number;
  pendingVisitors: number;
  activePolls: number;
}

export interface AdminDashboardStats extends ResidentDashboardStats {
  totalResidents: number;
  pendingApprovals: number;
  openComplaints: number;
  defaulterCount: number;
}

async function count(colName: string, ...constraints: ReturnType<typeof where>[]) {
  const snap = await getCountFromServer(
    query(collection(db, colName), ...constraints)
  );
  return snap.data().count;
}

export async function getResidentDashboardStats(
  societyId: string,
  userId: string
): Promise<ResidentDashboardStats> {
  const now = new Date();
  const [totalNotices, pendingComplaints, upcomingEvents, unpaidBills, pendingVisitors, activePolls] =
    await Promise.all([
      count(COLLECTIONS.NOTICES, where('societyId', '==', societyId)),
      count(
        COLLECTIONS.COMPLAINTS,
        where('societyId', '==', societyId),
        where('raisedBy', '==', userId),
        where('status', 'in', ['open', 'assigned', 'in_progress'])
      ),
      count(COLLECTIONS.EVENTS, where('societyId', '==', societyId), where('startAt', '>=', now)),
      count(
        COLLECTIONS.MAINTENANCE_BILLS,
        where('societyId', '==', societyId),
        where('residentId', '==', userId),
        where('status', 'in', ['unpaid', 'overdue'])
      ),
      count(
        COLLECTIONS.VISITORS,
        where('societyId', '==', societyId),
        where('hostUserId', '==', userId),
        where('status', '==', 'pending')
      ),
      count(COLLECTIONS.POLLS, where('societyId', '==', societyId), where('isActive', '==', true)),
    ]);

  return { totalNotices, pendingComplaints, upcomingEvents, unpaidBills, pendingVisitors, activePolls };
}

export async function getAdminDashboardStats(societyId: string): Promise<AdminDashboardStats> {
  const now = new Date();
  const [
    totalNotices,
    pendingComplaints,
    upcomingEvents,
    unpaidBills,
    pendingVisitors,
    activePolls,
    totalResidents,
    pendingApprovals,
    openComplaints,
    defaulterCount,
  ] = await Promise.all([
    count(COLLECTIONS.NOTICES, where('societyId', '==', societyId)),
    count(COLLECTIONS.COMPLAINTS, where('societyId', '==', societyId), where('status', 'in', ['open', 'assigned', 'in_progress'])),
    count(COLLECTIONS.EVENTS, where('societyId', '==', societyId), where('startAt', '>=', now)),
    count(COLLECTIONS.MAINTENANCE_BILLS, where('societyId', '==', societyId), where('status', 'in', ['unpaid', 'overdue'])),
    count(COLLECTIONS.VISITORS, where('societyId', '==', societyId), where('status', '==', 'pending')),
    count(COLLECTIONS.POLLS, where('societyId', '==', societyId), where('isActive', '==', true)),
    count(COLLECTIONS.USERS, where('societyId', '==', societyId), where('role', '==', 'resident')),
    count(COLLECTIONS.USERS, where('societyId', '==', societyId), where('approvalStatus', '==', 'pending')),
    count(COLLECTIONS.COMPLAINTS, where('societyId', '==', societyId), where('status', '==', 'open')),
    count(COLLECTIONS.MAINTENANCE_BILLS, where('societyId', '==', societyId), where('status', '==', 'overdue')),
  ]);

  return {
    totalNotices,
    pendingComplaints,
    upcomingEvents,
    unpaidBills,
    pendingVisitors,
    activePolls,
    totalResidents,
    pendingApprovals,
    openComplaints,
    defaulterCount,
  };
}

export async function getComplaintStatusBreakdown(societyId: string) {
  const statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'] as const;
  const counts = await Promise.all(
    statuses.map((status) =>
      count(COLLECTIONS.COMPLAINTS, where('societyId', '==', societyId), where('status', '==', status))
    )
  );
  return statuses.map((status, i) => ({ status, count: counts[i] }));
}

export async function getVisitorStatusBreakdown(societyId: string) {
  const statuses = ['pending', 'approved', 'checked_in', 'checked_out', 'rejected'] as const;
  const counts = await Promise.all(
    statuses.map((status) =>
      count(COLLECTIONS.VISITORS, where('societyId', '==', societyId), where('status', '==', status))
    )
  );
  return statuses.map((status, i) => ({ status, count: counts[i] }));
}

export async function getPaymentCollectionThisMonth(societyId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('societyId', '==', societyId),
      where('paidAt', '>=', startOfMonth)
    )
  );
  return snap.docs.reduce((sum, d) => sum + ((d.data() as Payment).amount ?? 0), 0);
}

export async function getSuperAdminStats() {
  const [totalSocieties, totalAdmins, totalResidents] = await Promise.all([
    count(COLLECTIONS.SOCIETIES),
    count(COLLECTIONS.USERS, where('role', '==', 'admin')),
    count(COLLECTIONS.USERS, where('role', '==', 'resident')),
  ]);
  return { totalSocieties, totalAdmins, totalResidents };
}

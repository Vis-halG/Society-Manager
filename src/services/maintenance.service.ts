import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { listAllUsersBySociety } from './users.service';
import { notifyUsers } from './notifications.service';
import { isOverdue } from '../utils/date';
import type { MaintenanceBill, Payment } from '../types';

export const FINE_PER_DAY = 10;

export function billsQuery(societyId: string, residentId?: string): Query<DocumentData> {
  const constraints = [where('societyId', '==', societyId)];
  if (residentId) constraints.push(where('residentId', '==', residentId));
  return query(collection(db, COLLECTIONS.MAINTENANCE_BILLS), ...constraints, orderBy('dueDate', 'desc'));
}

export async function generateMonthlyBills(input: {
  societyId: string;
  billMonth: string;
  amount: number;
  dueDate: Date;
}): Promise<{ created: number; skipped: number }> {
  const residents = (await listAllUsersBySociety(input.societyId)).filter(
    (u) => u.role === 'resident' && u.approvalStatus === 'approved'
  );

  let created = 0;
  let skipped = 0;

  for (const resident of residents) {
    const billId = `${resident.id}_${input.billMonth}`;
    const existing = await getDoc(doc(db, COLLECTIONS.MAINTENANCE_BILLS, billId));
    if (existing.exists()) {
      skipped += 1;
      continue;
    }
    await setDoc(doc(db, COLLECTIONS.MAINTENANCE_BILLS, billId), {
      societyId: input.societyId,
      flatId: '',
      flatNumber: resident.wing ? `${resident.wing}-${resident.flatNumber}` : resident.flatNumber ?? '',
      residentId: resident.id,
      billMonth: input.billMonth,
      amount: input.amount,
      fineAmount: 0,
      totalAmount: input.amount,
      dueDate: Timestamp.fromDate(input.dueDate),
      status: 'unpaid',
      paidAt: null,
      paymentId: null,
      createdAt: serverTimestamp(),
    });
    created += 1;

    await notifyUsers([resident.id], {
      societyId: input.societyId,
      type: 'maintenance',
      title: 'Maintenance Due',
      body: `Your ${input.billMonth} maintenance bill of ₹${input.amount} is due.`,
      data: { billId },
    });
  }

  return { created, skipped };
}

export async function recalculateFineIfOverdue(bill: MaintenanceBill): Promise<MaintenanceBill> {
  if (bill.status !== 'unpaid' || !isOverdue(bill.dueDate)) return bill;
  const daysOverdue = Math.max(
    1,
    Math.ceil((Date.now() - bill.dueDate.toDate().getTime()) / (1000 * 60 * 60 * 24))
  );
  const fineAmount = daysOverdue * FINE_PER_DAY;
  const totalAmount = bill.amount + fineAmount;
  await updateDoc(doc(db, COLLECTIONS.MAINTENANCE_BILLS, bill.id), {
    fineAmount,
    totalAmount,
    status: 'overdue',
  });
  return { ...bill, fineAmount, totalAmount, status: 'overdue' };
}

export async function recordPayment(input: {
  bill: MaintenanceBill;
  method: Payment['method'];
  transactionRef?: string;
}): Promise<string> {
  const paymentRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
    billId: input.bill.id,
    societyId: input.bill.societyId,
    residentId: input.bill.residentId,
    amount: input.bill.totalAmount,
    method: input.method,
    transactionRef: input.transactionRef ?? '',
    status: 'success',
    paidAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.MAINTENANCE_BILLS, input.bill.id), {
    status: 'paid',
    paidAt: serverTimestamp(),
    paymentId: paymentRef.id,
  });

  return paymentRef.id;
}

export function paymentsQuery(residentId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.PAYMENTS),
    where('residentId', '==', residentId),
    orderBy('paidAt', 'desc')
  );
}

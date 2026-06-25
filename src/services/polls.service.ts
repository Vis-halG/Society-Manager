import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { listAllUsersBySociety } from './users.service';
import { notifyUsers } from './notifications.service';
import type { Poll, PollOption } from '../types';

export function pollsQuery(societyId: string): Query<DocumentData> {
  return query(
    collection(db, COLLECTIONS.POLLS),
    where('societyId', '==', societyId),
    orderBy('createdAt', 'desc')
  );
}

export async function createPoll(input: {
  societyId: string;
  question: string;
  optionTexts: string[];
  deadline: Date;
  createdBy: string;
}) {
  const options: PollOption[] = input.optionTexts.map((text, i) => ({
    id: `opt_${i}`,
    text,
    voteCount: 0,
  }));
  await addDoc(collection(db, COLLECTIONS.POLLS), {
    societyId: input.societyId,
    question: input.question,
    options,
    createdBy: input.createdBy,
    deadline: Timestamp.fromDate(input.deadline),
    isActive: true,
    totalVotes: 0,
    createdAt: serverTimestamp(),
  });

  const residents = await listAllUsersBySociety(input.societyId);
  const residentIds = residents
    .filter((u) => u.role === 'resident' && u.approvalStatus === 'approved')
    .map((u) => u.id);
  await notifyUsers(residentIds, {
    societyId: input.societyId,
    type: 'poll',
    title: 'New Poll',
    body: input.question,
  });
}

export async function getUserVote(pollId: string, userId: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.VOTES, `${pollId}_${userId}`));
  return snap.exists() ? (snap.data() as { optionId: string }) : null;
}

export async function castVote(pollId: string, optionId: string, userId: string) {
  const voteRef = doc(db, COLLECTIONS.VOTES, `${pollId}_${userId}`);
  const pollRef = doc(db, COLLECTIONS.POLLS, pollId);

  await runTransaction(db, async (transaction) => {
    const existingVote = await transaction.get(voteRef);
    if (existingVote.exists()) {
      throw new Error('You have already voted in this poll.');
    }
    const pollSnap = await transaction.get(pollRef);
    if (!pollSnap.exists()) throw new Error('Poll not found.');
    const poll = pollSnap.data() as Poll;

    const updatedOptions = poll.options.map((opt) =>
      opt.id === optionId ? { ...opt, voteCount: opt.voteCount + 1 } : opt
    );

    transaction.set(voteRef, { pollId, userId, optionId, votedAt: serverTimestamp() });
    transaction.update(pollRef, { options: updatedOptions, totalVotes: poll.totalVotes + 1 });
  });
}

export async function closePoll(pollId: string) {
  await updateDoc(doc(db, COLLECTIONS.POLLS, pollId), { isActive: false });
}

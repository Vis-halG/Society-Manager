import dayjs from 'dayjs';
import type { Timestamp } from 'firebase/firestore';

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  return null;
}

export function formatDate(value: Timestamp | Date | null | undefined, fmt = 'DD MMM YYYY') {
  const date = toDate(value);
  return date ? dayjs(date).format(fmt) : '-';
}

export function formatDateTime(value: Timestamp | Date | null | undefined) {
  return formatDate(value, 'DD MMM YYYY, hh:mm A');
}

export function formatRelative(value: Timestamp | Date | null | undefined) {
  const date = toDate(value);
  if (!date) return '-';
  const diffMinutes = dayjs().diff(dayjs(date), 'minute');
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = dayjs().diff(dayjs(date), 'hour');
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = dayjs().diff(dayjs(date), 'day');
  if (diffDays < 7) return `${diffDays}d ago`;
  return dayjs(date).format('DD MMM YYYY');
}

export function isOverdue(dueDate: Timestamp | Date | null | undefined) {
  const date = toDate(dueDate);
  return date ? dayjs().isAfter(dayjs(date)) : false;
}

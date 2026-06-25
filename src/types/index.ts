import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'admin' | 'resident' | 'security';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age?: number;
  phone?: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  societyId: string | null;
  flatNumber?: string;
  wing?: string;
  profileImageUrl?: string | null;
  approvalStatus: ApprovalStatus;
  emailVerified: boolean;
  familyMembers?: FamilyMember[];
  fcmTokens?: string[];
  isOnline?: boolean;
  lastSeen?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  totalWings: number;
  totalFlats: number;
  adminIds: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Flat {
  id: string;
  societyId: string;
  wing: string;
  flatNumber: string;
  ownerUserId?: string | null;
  isOccupied: boolean;
  createdAt: Timestamp;
}

export interface Attachment {
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  sizeBytes?: number;
}

export interface Notice {
  id: string;
  societyId: string;
  title: string;
  description: string;
  category: 'general' | 'event' | 'maintenance' | 'urgent';
  isPinned: boolean;
  attachments: Attachment[];
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp | null;
}

export type ComplaintCategory =
  | 'plumbing'
  | 'electrical'
  | 'security'
  | 'housekeeping'
  | 'parking'
  | 'others';

export type ComplaintStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface Complaint {
  id: string;
  societyId: string;
  raisedBy: string;
  raisedByName: string;
  flatNumber?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  images: Attachment[];
  status: ComplaintStatus;
  assignedTo?: string | null;
  assignedToName?: string | null;
  remarks?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp | null;
}

export interface MaintenanceBill {
  id: string;
  societyId: string;
  flatId: string;
  flatNumber: string;
  residentId: string;
  billMonth: string; // e.g. "2026-06"
  amount: number;
  fineAmount: number;
  totalAmount: number;
  dueDate: Timestamp;
  status: 'unpaid' | 'paid' | 'overdue';
  paidAt?: Timestamp | null;
  paymentId?: string | null;
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  billId: string;
  societyId: string;
  residentId: string;
  amount: number;
  method: 'upi' | 'card' | 'netbanking' | 'cash' | 'cheque';
  transactionRef?: string;
  receiptUrl?: string;
  status: 'success' | 'pending' | 'failed';
  paidAt: Timestamp;
}

export type VisitorStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'checked_in'
  | 'checked_out';

export interface Visitor {
  id: string;
  societyId: string;
  hostUserId: string;
  hostFlatNumber: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  qrCode: string;
  status: VisitorStatus;
  preApproved: boolean;
  entryTime?: Timestamp | null;
  exitTime?: Timestamp | null;
  verifiedBy?: string | null;
  createdAt: Timestamp;
}

export interface ParkingSlot {
  id: string;
  societyId: string;
  slotNumber: string;
  type: 'two_wheeler' | 'four_wheeler' | 'visitor';
  isAllocated: boolean;
  allocatedTo?: string | null;
  vehicleId?: string | null;
}

export interface Vehicle {
  id: string;
  societyId: string;
  ownerUserId: string;
  ownerName: string;
  vehicleNumber: string;
  vehicleType: 'two_wheeler' | 'four_wheeler';
  parkingSlotId?: string | null;
  createdAt: Timestamp;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  societyId: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  deadline: Timestamp;
  isActive: boolean;
  totalVotes: number;
  createdAt: Timestamp;
}

export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  votedAt: Timestamp;
}

export interface SocietyEvent {
  id: string;
  societyId: string;
  title: string;
  description: string;
  location: string;
  startAt: Timestamp;
  endAt: Timestamp;
  bannerUrl?: string | null;
  gallery: string[];
  rsvps: Record<string, 'going' | 'not_going' | 'maybe'>;
  createdBy: string;
  createdAt: Timestamp;
}

export type DocumentCategory =
  | 'society_rules'
  | 'meeting_minutes'
  | 'receipts'
  | 'forms'
  | 'circulars';

export interface SocietyDocument {
  id: string;
  societyId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: Timestamp;
}

export type NotificationType =
  | 'notice'
  | 'complaint'
  | 'visitor'
  | 'maintenance'
  | 'poll'
  | 'event'
  | 'chat';

export interface AppNotification {
  id: string;
  userId: string;
  societyId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  societyId: string;
  type: 'direct' | 'complaint';
  participantIds: string[];
  complaintId?: string | null;
  lastMessage?: string;
  lastMessageAt?: Timestamp | null;
  unreadCount?: Record<string, number>;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  readBy: string[];
  createdAt: Timestamp;
}

export interface EmergencyContact {
  id: string;
  societyId: string;
  label: string;
  name: string;
  phone: string;
  icon: string;
}

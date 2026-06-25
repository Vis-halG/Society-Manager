export const COLLECTIONS = {
  USERS: 'users',
  SOCIETIES: 'societies',
  FLATS: 'flats',
  NOTICES: 'notices',
  COMPLAINTS: 'complaints',
  COMPLAINT_MESSAGES: 'complaintMessages',
  MAINTENANCE_BILLS: 'maintenanceBills',
  PAYMENTS: 'payments',
  VISITORS: 'visitors',
  PARKING_SLOTS: 'parkingSlots',
  VEHICLES: 'vehicles',
  POLLS: 'polls',
  VOTES: 'votes',
  EVENTS: 'events',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  CHAT_ROOMS: 'chatRooms',
  MESSAGES: 'messages',
  EMERGENCY_CONTACTS: 'emergencyContacts',
} as const;

export const COMPLAINT_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', icon: 'pipe-wrench' },
  { value: 'electrical', label: 'Electrical', icon: 'flash' },
  { value: 'security', label: 'Security', icon: 'shield-account' },
  { value: 'housekeeping', label: 'Housekeeping', icon: 'broom' },
  { value: 'parking', label: 'Parking', icon: 'car' },
  { value: 'others', label: 'Others', icon: 'dots-horizontal-circle' },
] as const;

export const COMPLAINT_STATUSES = [
  'open',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
] as const;

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const DOCUMENT_CATEGORIES = [
  { value: 'society_rules', label: 'Society Rules' },
  { value: 'meeting_minutes', label: 'Meeting Minutes' },
  { value: 'receipts', label: 'Maintenance Receipts' },
  { value: 'forms', label: 'Forms' },
  { value: 'circulars', label: 'Circulars' },
] as const;

export const NOTICE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'urgent', label: 'Urgent' },
] as const;

export const VEHICLE_TYPES = [
  { value: 'two_wheeler', label: 'Two Wheeler' },
  { value: 'four_wheeler', label: 'Four Wheeler' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Society Admin',
  resident: 'Resident',
  security: 'Security',
};

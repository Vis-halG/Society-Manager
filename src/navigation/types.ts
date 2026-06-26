import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type NoticesStackParamList = {
  NoticeList: undefined;
  NoticeDetail: { noticeId: string };
  NoticeForm: { noticeId?: string } | undefined;
};

export type ComplaintsStackParamList = {
  ComplaintList: undefined;
  ComplaintDetail: { complaintId: string };
  ComplaintForm: undefined;
  ComplaintChat: { complaintId: string };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatRoomId: string; otherUserId: string };
};

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  BillDetail: { billId: string };
  BillGenerate: undefined;
  Defaulters: undefined;
};

export type VisitorsStackParamList = {
  VisitorList: undefined;
  VisitorForm: undefined;
  VisitorDetail: { visitorId: string };
  SecurityScan: undefined;
};

export type ParkingStackParamList = {
  ParkingOverview: undefined;
  VehicleForm: { vehicleId?: string } | undefined;
};

export type PollsStackParamList = {
  PollList: undefined;
  PollDetail: { pollId: string };
  PollForm: undefined;
};

export type EventsStackParamList = {
  EventList: undefined;
  EventDetail: { eventId: string };
  EventForm: undefined;
};

export type DocumentsStackParamList = {
  DocumentList: undefined;
  DocumentUpload: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  FamilyMembers: undefined;
  Settings: undefined;
};

export type SuperAdminStackParamList = {
  ManageSocieties: undefined;
  SocietyForm: { societyId?: string } | undefined;
  ManageAdmins: { societyId: string; societyName: string };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Maintenance: undefined;
  Visitors: undefined;
  Parking: undefined;
  Polls: undefined;
  Events: undefined;
  Documents: undefined;
  ProfileStack: undefined;
  Notifications: undefined;
  EmergencyContacts: undefined;
  ResidentApprovals: undefined;
  Reports: undefined;
};

export type TabsParamList = {
  Dashboard: undefined;
  Notices: undefined;
  Complaints: undefined;
  Chat: undefined;
  More: NavigatorScreenParams<MoreStackParamList> | undefined;
};

export type SecurityTabsParamList = {
  Visitors: undefined;
  ProfileStack: undefined;
};

export type SuperAdminTabsParamList = {
  ManageSocieties: undefined;
  Reports: undefined;
  ProfileStack: undefined;
};

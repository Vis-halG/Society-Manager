# Society Manager

A production-grade Society Management mobile app built with **React Native (Expo)** and **Firebase**. Supports Super Admin, Society Admin, Resident, and Security roles with role-based navigation, realtime data, chat, visitor QR passes, maintenance billing, polls, events, and a document repository.

## Tech Stack

| Concern | Choice |
|---|---|
| App framework | React Native + Expo (SDK 56, TypeScript) |
| Backend | Firebase Spark-compatible default: Auth + Firestore + in-app notifications |
| Navigation | React Navigation (native-stack, bottom-tabs, drawer) |
| State | React Context API (`AuthContext`, `ThemeContext`) |
| Forms | React Hook Form |
| UI | React Native Paper + `@expo/vector-icons` |
| Charts | `react-native-chart-kit` |
| QR | `react-native-qrcode-svg` (generate), `expo-camera` (scan) |

## Folder Structure

```
src/
  config/         Firebase initialization (auth/firestore, optional storage)
  constants/      Collection names, enums, label maps
  context/        AuthContext (RBAC) and ThemeContext (light/dark)
  hooks/          useCollection (realtime query hook), useUserProfile
  navigation/     Per-role navigators + RootNavigator + shared param types
  services/       One file per domain — Firestore reads/writes and optional storage helpers
  screens/        One folder per module (auth, dashboard, notices, complaints, chat,
                  maintenance, visitors, parking, polls, events, documents, profile,
                  admin, superadmin, emergency, notifications)
  components/     common/ (ScreenContainer, FormInput, ChatBubble, StatusBadge, ...)
                  cards/ (StatCard, NoticeCard, ComplaintCard, ...)
  theme/          Color palette + React Native Paper / Navigation theme objects
  types/          Shared TypeScript types mirroring the Firestore schema
  utils/          Date formatting helpers
firestore.rules           Firestore security rules
firestore.indexes.json    Composite indexes required by the app's queries
storage.rules             Optional Firebase Storage security rules for Blaze projects
firebase.json             Points the Firebase CLI at the Spark-safe Firestore rules/indexes
```

## Roles

- **Super Admin** — creates/manages societies, promotes residents to Society Admin, views platform-wide reports. Has no single `societyId`.
- **Society Admin** — approves residents, manages notices/complaints/maintenance/visitors/parking/polls, views society reports.
- **Resident** — everything in the spec: notices, complaints, maintenance, visitors, chat with admin, polls, events, documents.
- **Security** — a minimal app surface: scan visitor QR codes, approve/reject gate entry, view visitor history.

Roles are stored on the `users/{uid}` document (`role` field) and enforced both in the UI (`RootNavigator` picks the navigator tree per role) and in `firestore.rules` (server-side enforcement — never trust the client alone).

## Demo Login Details and Accessible Modules

Only the four demo logins below are intentionally supported in Firebase project `mgmt-95506`, and each has a matching approved `users/{uid}` Firestore document. Society Admin, Resident, and Security are assigned to `demo-society`; Super Admin has `societyId: null`.

Checked and verified on `2026-06-26`: all four emails below sign in successfully with password `Demo@123456`.

> These credentials are for local/demo testing only. Change or remove them before using a live Firebase project.

| User type | Login ID / Email | Password | Firebase login status | Firestore role | Accessible modules |
|---|---|---|---|---|---|
| Super Admin | `superadmin@societymanager.demo` | `Demo@123456` | Verified working | `super_admin` | Societies, Manage Society Admins, Reports & Analytics, Profile & Settings |
| Society Admin | `admin@societymanager.demo` | `Demo@123456` | Verified working | `admin` | Dashboard, Notices, Complaints, Chat, Maintenance, Visitors, Parking, Polls, Events, Documents, Notifications, Emergency Contacts, Resident Approvals, Reports & Analytics, Profile & Settings |
| Resident | `resident@societymanager.demo` | `Demo@123456` | Verified working | `resident` | Dashboard, Notices, Complaints, Chat, Maintenance, Visitors, Parking, Polls, Events, Documents, Notifications, Emergency Contacts, Profile & Settings |
| Security | `security@societymanager.demo` | `Demo@123456` | Verified working | `security` | Visitor Gate, QR Scan, Visitor Check-in/Check-out, Visitor History, Profile & Settings |

### If Demo Login Stops Working

1. Open Firebase Console → Authentication → Users.
2. Create each email above, or reset the password for the existing account to `Demo@123456`.
3. For each Firebase Auth user, copy the `uid`.
4. In Firestore, create/update `users/{uid}` with `role`, `approvalStatus: "approved"`, and the required profile fields.
5. Set `societyId: null` only for Super Admin. Set a valid society document ID for Society Admin, Resident, and Security.

### Role Access Details

- **Super Admin** can create and edit societies, view all society records, assign or remove Society Admin users, view platform-level reports, and manage their own profile.
- **Society Admin** can approve or reject residents, make approved users Security users, publish notices, handle complaints, generate maintenance bills, view defaulters, manage visitor records, create parking slots, allocate parking, create polls/events/documents/emergency contacts, use chat, view notifications, and open society reports.
- **Resident** can view society notices, create and track complaints, chat with the society admin, view/pay maintenance bills, create visitor passes, register vehicles, vote in polls, view events/documents/emergency contacts, read notifications, manage family/profile details, and change password.
- **Security** can access the visitor gate flow only: scan visitor QR codes, approve/reject gate entries, check visitors in/out, view visitor history, and manage their own profile.
- **Pending or rejected users** cannot access the main app modules. They are routed to the pending approval screen until a Society Admin approves them.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. For Google login on web, **Authentication** → Sign-in method → enable **Google** and add your app domains under **Authentication** → **Settings** → **Authorized domains**. For local testing this usually includes `localhost`; for deployment add domains such as `mgmt-95506.web.app` or your Vercel domain.
4. **Firestore Database** → Create database (start in production mode — rules are provided below).
5. **Project settings → General → Your apps** → add a **Web app** (Expo uses the Firebase JS SDK even on native) and copy the config values.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with the Firebase web app values from step 2.4. Keep `EXPO_PUBLIC_USE_FIREBASE_STORAGE=false` on the Spark plan. All variables are prefixed `EXPO_PUBLIC_` so Expo inlines them at build time — **do not** put secrets here that must stay server-side (Firebase web config values are safe to ship in a client app; access is governed by `firestore.rules`, not by hiding the API key).

### 4. Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add               # select your Firebase project
firebase deploy --only firestore:rules,firestore:indexes
```

### Spark plan file attachments

Firebase Storage buckets are not part of the default Spark setup for this app. With `EXPO_PUBLIC_USE_FIREBASE_STORAGE=false`, image/document pickers store local device URIs in Firestore metadata so the app can run without Blaze. Those local attachments are useful for testing on the current device only; cross-device cloud attachments require enabling Firebase Storage on Blaze or wiring another storage provider.

### Google login support

Google login is currently implemented for the web build through Firebase Authentication. If popups are blocked, the app falls back to Firebase's redirect flow. Native Android/iOS Google login requires a development build and a native Google sign-in package such as `@react-native-google-signin/google-signin`; it will not work inside Expo Go without that extra native setup.

### 5. Bootstrap the first Super Admin

Registration in-app always creates a `resident` account pending approval — there is intentionally no UI path to self-register as Super Admin. After your first user registers, open Firestore in the console and manually set on `users/{uid}`:

```
role: "super_admin"
approvalStatus: "approved"
societyId: null
```

From there, the Super Admin can create societies and promote other residents to Society Admin from inside the app.

### 6. Run the app

```bash
npx expo start
```

Scan the QR with Expo Go, or press `a` / `i` for an emulator/simulator. Camera-dependent screens (QR scanning, image picking) require a physical device or a simulator with camera support.

## Web Deployment

This project exports as a static Expo web app. Vercel should build it with `npm run build` and serve the `dist` directory.

```bash
npm run build
```

Firebase Hosting uses the same export:

```bash
npm run build:web
firebase deploy --only hosting
```

Current Firebase Hosting URL:

```text
https://mgmt-95506.web.app
```

## Firestore Collections

`users`, `societies`, `flats`, `notices`, `complaints`, `complaintMessages`, `maintenanceBills`, `payments`, `visitors`, `parkingSlots`, `vehicles`, `polls`, `votes`, `events`, `documents`, `notifications`, `chatRooms`, `messages`, `emergencyContacts` — see `src/types/index.ts` for the exact shape of each, and `src/constants/index.ts` for collection name constants.

## Push Notifications — architecture note

This app writes a `notifications/{id}` document (and registers each device's Expo push token onto `users/{uid}.fcmTokens`) whenever a notice/poll is published, a complaint status changes, a visitor checks in, or a maintenance bill is generated. That covers the **in-app notification inbox** (Drawer → Notifications) end to end.

Actually delivering a **push** to another user's device cannot be done from their phone — it must be triggered by a trusted backend, because a client only has permission to act on its own behalf. Cloud Functions require Blaze, so Spark-plan projects should treat this as future production work. The standard pattern is a small Cloud Function:

```js
// functions/index.js (not included — add when you set up Cloud Functions)
exports.sendPushOnNotification = functions.firestore
  .document('notifications/{id}')
  .onCreate(async (snap) => {
    const { userId, title, body, data } = snap.data();
    const user = await admin.firestore().doc(`users/${userId}`).get();
    const tokens = user.data()?.fcmTokens ?? [];
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens.map((to) => ({ to, title, body, data }))),
    });
  });
```

Add this (or the FCM Admin SDK equivalent) after moving to Blaze and running `firebase init functions`; cross-device push delivery then works without client code changes.

## Known scope notes

- **Payments** are recorded as confirmed immediately (`recordPayment`) to demonstrate the full bill → pay → receipt flow. There is no real payment gateway (Razorpay/Stripe/UPI) wired up; plug one in at `src/services/maintenance.service.ts#recordPayment` and move the "mark paid" confirmation server-side (Cloud Function/webhook) before going live with real money.
- The `flats` collection exists in the schema/types but isn't actively managed by a screen — maintenance billing and visitor host info key off the resident's `wing`/`flatNumber` fields directly, which is sufficient for the flows implemented. Add a Flats CRUD screen if you need formal flat↔owner inventory management.
- Event reminders (FCM type `event`) are not auto-scheduled — wire a scheduled Cloud Function if you want T-minus-1-day reminders.

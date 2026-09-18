# ZYVEN — AI-Powered Healthcare Assistance Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-latest-green.svg)

## 1. Project Overview

ZYVEN is a production-ready, full-stack AI healthcare platform designed specifically for senior citizens, caregivers, and family members. It provides a comprehensive ecosystem for health management and emergency response.

**Key Features:**
- **AI Voice Companion:** Empathetic, conversational healthcare assistant.
- **Medical Report Analysis:** AI-powered extraction and summarization of key findings from medical reports.
- **Medication Management:** Scheduling, adherence tracking, and automated reminders.
- **Hospital Finder:** Geospatial search for nearby emergency and healthcare facilities.
- **Government Schemes:** Matching users with eligible healthcare and pension schemes.
- **Emergency SOS:** Real-time, location-aware emergency alerts for caregivers and family.
- **Caregiver Dashboard:** Centralized view for family members to monitor and manage health data.

**Core Technologies:** React + Vite, Node.js + Express, MongoDB, Firebase Auth, Google Gemini AI, Socket.IO.

## 2. Features

1. **Dashboard:** Centralized overview of daily schedule, upcoming medications, and health summaries.
2. **AI Voice Companion:** Interactive chat and voice interface for health inquiries and support.
3. **Medical Reports:** Secure upload and AI analysis of PDF and image-based medical reports.
4. **Medications:** Comprehensive schedule, dosage tracking, and adherence history.
5. **Emergency SOS:** Rapid alert system triggering notifications and real-time location sharing.
6. **Hospitals:** Interactive map and directory of nearby healthcare facilities.
7. **Government Schemes:** Curated list of healthcare, housing, and pension schemes with eligibility checks.
8. **Caregiver Portal:** Tools for family members to link accounts and monitor the senior's well-being.
9. **Profile Management:** User details, emergency contacts, and personalized settings.
10. **Admin Panel:** Platform management, user oversight, and system health monitoring.

## 3. Tech Stack

### Frontend
- React 18, Vite
- Tailwind CSS, Framer Motion
- Recharts, Lucide React
- Leaflet (Maps)
- Socket.IO Client
- Firebase Client SDK

### Backend
- Node.js, Express.js
- MongoDB + Mongoose
- Firebase Admin SDK
- Google Gemini AI
- Nodemailer, Socket.IO
- Multer, pdf-parse

### Security
- Helmet, CORS
- Rate Limiting (express-rate-limit)
- Firebase Token Verification
- Role-based Authorization
- Request Validation (express-validator)

## 4. Project Structure

```text
c:\Zyven
├── client
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── server
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    ├── .env.example
    ├── package.json
    └── server.js
```

## 5. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas cluster)
- Firebase project (Authentication)
- Google Gemini API key (optional, for AI features)
- SMTP email credentials (optional, for email notifications)

## 6. Installation

**Step-by-step:**

```bash
# Clone the repository
git clone <repo>
cd Zyven

# Backend Setup
cd server
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend Setup
cd ../client
npm install
cp .env.example .env
# Edit .env with Firebase config
```

## 7. Environment Variables

### `server/.env`
```env
PORT=5000                              # The port the server runs on
MONGODB_URI=mongodb://localhost:27017/zyven # MongoDB connection string
FIREBASE_PROJECT_ID=your-project-id    # Firebase Project ID
FIREBASE_CLIENT_EMAIL=your-email       # Firebase Admin Client Email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" # Firebase Admin Private Key
GEMINI_API_KEY=your-gemini-key         # Google Gemini AI API Key
EMAIL_HOST=smtp.example.com            # SMTP Server Host
EMAIL_PORT=587                         # SMTP Server Port
EMAIL_USER=your-email@example.com      # SMTP User
EMAIL_PASSWORD=your-email-password     # SMTP Password
EMAIL_FROM=noreply@zyven.com           # Default sender email
JWT_SECRET=your-jwt-secret             # Secret for any custom JWTs
CLIENT_URL=http://localhost:5173       # Allowed CORS origin
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000     # Backend API URL
VITE_FIREBASE_API_KEY=your-api-key     # Firebase Client API Key
VITE_FIREBASE_AUTH_DOMAIN=your-domain  # Firebase Auth Domain
VITE_FIREBASE_PROJECT_ID=your-id       # Firebase Project ID
VITE_FIREBASE_STORAGE_BUCKET=bucket    # Firebase Storage Bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=id   # Firebase Messaging Sender ID
VITE_FIREBASE_APP_ID=app-id            # Firebase App ID
```

## 8. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Authentication** > **Sign-in method** and enable **Email/Password** and **Google**.
3. Go to **Project Settings** > **Service accounts** and click **Generate new private key**. Download the JSON file and extract `project_id`, `client_email`, and `private_key` into the `server/.env`.
4. Go to **Project Settings** > **General**, add a Web App, and copy the `firebaseConfig` variables into `client/.env`.

## 9. MongoDB Setup

You can use a local MongoDB instance (`mongodb://localhost:27017/zyven`) or set up a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database). Update the `MONGODB_URI` in `server/.env`.

## 10. Google Gemini API Setup

To enable AI Chat and Medical Report Analysis:
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create an API key.
3. Add it to `server/.env` as `GEMINI_API_KEY`.

## 11. Email Setup

To enable email notifications (SOS, Reminders, Reports):
1. Use an SMTP provider (SendGrid, Mailgun) or a Gmail account.
2. If using Gmail, enable 2-Step Verification and generate an **App Password**.
3. Fill in `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD` in `server/.env`.

## 12. Running the Application

Open two terminal windows/tabs:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## 13. API Documentation

### Auth `/api/auth`
- `POST /sync` - Sync Firebase user to MongoDB
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile details

### Medications `/api/medications`
- `GET /` - List user medications
- `POST /` - Create a medication
- `GET /today` - Get today's medication schedule
- `PUT /:id` - Update medication
- `DELETE /:id` - Delete medication
- `POST /:id/adherence` - Record taken/missed dose
- `GET /:id/adherence` - Get adherence history

### Medical Reports `/api/reports`
- `GET /` - List user reports
- `POST /` - Upload and analyze report (multipart/form-data)
- `GET /:id` - Get specific report
- `DELETE /:id` - Delete report
- `POST /:id/reanalyze` - Rerun AI analysis

### AI Chat `/api/ai`
- `GET /conversations` - List chat history
- `POST /chat` - Send a message to AI companion
- `GET /conversations/:id` - Get specific conversation
- `DELETE /conversations/:id` - Delete conversation

### Emergency `/api/emergency`
- `POST /sos` - Trigger SOS alert
- `POST /sos/:id/cancel` - Cancel active SOS
- `GET /active` - Get currently active SOS event
- `GET /history` - Get emergency history

### Hospitals `/api/hospitals`
- `GET /search` - Search hospitals by proximity (lat/lng)
- `GET /` - List all hospitals
- `POST /`, `PUT /:id`, `DELETE /:id` - (Admin only) Manage hospitals

### Government Schemes `/api/schemes`
- `GET /` - List active schemes
- `POST /eligible` - Get AI recommendations based on user profile
- `POST /`, `PUT /:id`, `DELETE /:id` - (Admin only) Manage schemes

### Notifications `/api/notifications`
- `GET /` - List user notifications
- `GET /unread-count` - Get unread count
- `PUT /mark-all-read` - Mark all as read
- `PUT /:id` - Mark specific as read
- `DELETE /:id` - Delete notification

### Admin `/api/admin`
- `GET /dashboard` - System statistics
- `GET /users` - List all users
- `POST /users/:id/manage` - Manage user state
- `GET /health` - System health check
- `POST /seed` - Seed demo data

## 14. Demo Mode

The application degrades gracefully if third-party keys are missing:
- Without `GEMINI_API_KEY`, AI chat and report analysis will return standard fallback responses or errors.
- Without SMTP credentials, emails will simply be skipped, but in-app notifications (Socket.IO) will still function.
- Without Firebase Admin credentials, a mock local user is injected for development purposes (check `server/middleware/auth.js`).

## 15. Deployment

- **Frontend:** Can be deployed to [Vercel](https://vercel.com/) or Netlify using `vite build`.
- **Backend:** Can be deployed to [Render](https://render.com/), Railway, or Heroku.
- **Database:** MongoDB Atlas is recommended for production.
- **Environment Variables:** Ensure all variables are set securely in your hosting provider's dashboard.
- **CORS:** Ensure `CLIENT_URL` in the backend points to your production frontend domain.

## 16. Security Notes

- **Authentication:** All protected routes verify Firebase JWT tokens.
- **Authorization:** Strict Role-Based Access Control (RBAC) ensures users only access permitted data.
- **Validation:** Frontend and backend (express-validator) both sanitize and validate inputs.
- **File Uploads:** Multer restricts uploads by MIME type (PDF/Images only) and limits sizes to 10MB to prevent abuse.
- **Rate Limiting:** Global rate limiters (100 req/15m) and auth-specific limiters (20 req/15m) prevent brute force and DoS attacks.
- **Secrets:** No secrets or credentials are hardcoded.
- **Production:** Always use HTTPS.

## 17. Design System

The application strictly adheres to the ZYVEN design system:
- **Primary:** `#3D5A45` (Forest Green - Trust, Healthcare)
- **Background:** `#FDFBF7` (Warm Off-White - Easy on senior eyes)
- **Accent:** `#E07A5F` (Terracotta - Actions, Notifications)
- **Emergency:** `#D90429` (Crimson Red - SOS, Critical Alerts)
- **Typography:** Inter font family for maximum legibility.
- **Accessibility:** High contrast ratios, large text sizing by default, mobile-first responsive layouts, and robust keyboard navigation support.

## 18. Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 19. License

This project is licensed under the MIT License - see the LICENSE file for details.

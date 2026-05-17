<div align="center">

# 🔍 FindSafe.ai
### AI-Powered Missing Person Detection System

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.x-black?style=for-the-badge&logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql)
![DeepFace](https://img.shields.io/badge/DeepFace-VGG--Face-purple?style=for-the-badge)

**FindSafe.ai** is a full-stack AI system that helps locate missing persons using face recognition.  
The public uploads sightings → AI matches faces → Family gets instant email alerts with location.

</div>

---

## 📸 Screenshots

> 

---

## ✨ Features

- 🧠 **AI Face Recognition** — DeepFace (VGG-Face model) with cosine similarity matching
- 📸 **Public Sighting Portal** — Anyone can upload a photo, no login required
- 📍 **Auto Location Capture** — GPS coordinates captured on every sighting
- 🚨 **Instant Email Alerts** — Family notified with match confidence %, Google Maps link, and sighting photo
- 👮 **Multi-Organization Auth** — Police stations and NGOs register and get approved by Super Admin
- 🔄 **Rescan Feature** — Police can upload new photo and rescan all existing sightings
- 🛡️ **Rate Limiting** — Max 5 uploads per IP per hour to prevent abuse
- 🗑️ **Case Management** — Add, view, expand, and delete missing person cases
- 👑 **Super Admin Portal** — Hidden portal to approve/reject organization registrations

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     3 Portals                           │
├─────────────────┬──────────────────┬────────────────────┤
│  Public Portal  │   Admin Portal   │  Super Admin       │
│  (No login)     │  (Police / NGO)  │  (System Owner)    │
│                 │                  │                    │
│  Upload photo   │  Add missing     │  Approve/reject    │
│  Auto location  │  person          │  organizations     │
│  Anonymous      │  View cases      │                    │
│                 │  Rescan          │                    │
└────────┬────────┴────────┬─────────┴────────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────┐
│         Flask REST API          │
│  Rate limiting · JWT-style auth │
│  File validation · CORS         │
└───────────────┬─────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌─────────────────────────────┐
│  MySQL DB    │  │   DeepFace AI Engine         │
│              │  │                              │
│  sightings   │  │  VGG-Face model              │
│  persons     │  │  Cosine similarity matching  │
│  orgs        │  │  Face encoding storage       │
│  matches     │  │                              │
└──────────────┘  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │      Gmail SMTP Alert         │
                  │                              │
                  │  Match confidence %           │
                  │  Google Maps location link   │
                  │  Sighting photo attached     │
                  └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, Axios, React Router |
| **Backend** | Python, Flask, Flask-CORS, Flask-Limiter |
| **AI / ML** | DeepFace, VGG-Face Model, OpenCV |
| **Database** | MySQL, python-dotenv |
| **Email** | Gmail SMTP, Python smtplib |
| **Auth** | Token-based, Werkzeug password hashing |
| **Storage** | Local file system (AWS S3 ready) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Gmail account with App Password enabled

### 1. Clone the repositories

```bash
# Backend
git clone https://github.com/user1-prajwal/findsafe-backend.git
cd findsafe-backend

# Frontend (separate repo)
git clone https://github.com/user1-prajwal/findsafe-frontend.git
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your MySQL and Gmail credentials
```

### 3. Database Setup

```sql
CREATE DATABASE missing_finder;
USE missing_finder;

CREATE TABLE organizations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        ENUM('police', 'ngo', 'superadmin') DEFAULT 'ngo',
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE missing_persons (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100),
    age          INT,
    image_path   VARCHAR(255),
    encoding     LONGTEXT,
    family_email VARCHAR(100),
    added_by     INT,
    added_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES organizations(id)
);

CREATE TABLE public_sightings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    image_path  VARCHAR(255),
    encoding    LONGTEXT,
    latitude    DECIMAL(10, 8),
    longitude   DECIMAL(11, 8),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then create the Super Admin account:

```bash
python fix_password.py
```

### 4. Run Backend

```bash
python app.py
# Runs on http://localhost:5000
```

### 5. Frontend Setup

```bash
npm install
npm start
# Runs on http://localhost:3000
```

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/public/upload` | Upload sighting photo + location |
| `GET` | `/api/stats` | Get real-time system stats |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new organization |
| `POST` | `/api/auth/login` | Login (all org types) |

### Admin (requires token)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/add-missing` | Add missing person + scan |
| `GET` | `/api/admin/missing-persons` | Get all cases |
| `POST` | `/api/admin/rescan` | Rescan with new photo |
| `DELETE` | `/api/admin/delete-person/:id` | Delete a case |

### Super Admin (requires super token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/superadmin/pending` | View pending registrations |
| `GET` | `/api/superadmin/approved` | View approved organizations |
| `POST` | `/api/superadmin/approve/:id` | Approve an organization |
| `DELETE` | `/api/superadmin/reject/:id` | Reject an organization |

---

## 🔒 Security Features

- **Rate Limiting** — 5 uploads/hour per IP (Flask-Limiter)
- **File Validation** — Type check (JPG/PNG only) + 5MB size limit
- **Password Hashing** — Werkzeug bcrypt hashing
- **Token Auth** — Role-based access on all admin routes
- **Safe Updates** — No passwords or encodings exposed to frontend
- **CORS** — Configured for frontend origin only

---

## 📁 Project Structure

```
MPF-backend/
├── app.py              # Flask API — all routes
├── database.py         # MySQL connection + CRUD operations
├── matcher.py          # Face matching engine (cosine similarity)
├── email_service.py    # Gmail SMTP alert with HTML email
├── fix_password.py     # One-time super admin setup script
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── .env                # Your actual credentials (not in git)
└── uploads/            # Uploaded images (not in git)

MPF-frontend/
├── src/
│   ├── pages/
│   │   ├── PublicUpload.jsx        # Public sighting portal
│   │   ├── AdminLogin.jsx          # Organization login
│   │   ├── AdminDashboard.jsx      # Police/NGO dashboard
│   │   ├── Register.jsx            # Organization registration
│   │   ├── SuperAdminLogin.jsx     # Super admin login
│   │   └── SuperAdminDashboard.jsx # Approve/reject orgs
│   ├── components/
│   │   └── Navbar.jsx              # Navigation bar
│   └── App.js                      # Routes
```

---

## 🧠 How the AI Matching Works

```
1. Admin uploads missing person photo
         ↓
2. DeepFace extracts 512-dimension face encoding
   (VGG-Face model — trained on millions of faces)
         ↓
3. Encoding stored as JSON in MySQL
         ↓
4. Public uploads sighting photo
         ↓
5. System extracts encoding from sighting
         ↓
6. Cosine similarity calculated against ALL stored encodings
   similarity = dot(A, B) / (||A|| × ||B||)
         ↓
7. If distance < 0.4 threshold → MATCH FOUND
         ↓
8. Email sent to family with:
   - Match confidence percentage
   - Google Maps link of sighting location
   - Actual sighting photo attached
```

---

## 📧 Email Alert Preview

When a match is found, family receives:

```
🚨 POSSIBLE MATCH FOUND

Person          : [Name]
Match Confidence: 87.5%
Location        : 12.9716, 77.5946

[ 📍 View Location on Google Maps ]

📸 Photo uploaded by public: [image attached]

⚠️ This is an AI-based match. Please verify in person.
```

---

## 🔮 Future Improvements

- [ ] Deploy on AWS EC2 + S3 for image storage
- [ ] Super Admin web portal (currently API only)
- [ ] WhatsApp alerts via Twilio API
- [ ] Video frame extraction for sighting videos
- [ ] Mobile app (React Native)
- [ ] National missing persons database integration

---

## 👨‍💻 Author

[![GitHub](https://img.shields.io/badge/GitHub-user1--prajwal-black?style=flat&logo=github)](https://github.com/user1-prajwal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Prajwal_Poojari-blue?style=flat&logo=linkedin)](https://linkedin.com/in/Prajwal-Poojari)
[![Email](https://img.shields.io/badge/Email-prajwalpoojari451@gmail.com-red?style=flat&logo=gmail)](mailto:prajwalpoojari451@gmail.com)

---

<div align="center">
  <i>Built with ❤️ to help reunite families</i>
</div>

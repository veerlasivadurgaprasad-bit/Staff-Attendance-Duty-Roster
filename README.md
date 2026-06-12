# FirstCry Intellitots - Staff Attendance & Duty Roster System

A modern education management full-stack web application designed for preschool and daycare operations at **FirstCry Intellitots**. The system automates teacher/helper check-ins, classroom layouts, weekly duty allocations, task checklists, and provides AI-driven staffing summaries.

---

## ✨ Features

- **Multi-Role Security**: Personalized dashboard features and write restrictions for **Admin**, **Centre Head**, **Teacher**, and **Helper**.
- **Real-Time Attendance Register**: Clock-in and clock-out timestamps with Present, Absent, Half-Day, and Leave options.
- **Weekly & Monthly Duty Roster**: Calendar grid matrix for assigning teachers and helpers to specific shifts and classrooms.
- **Interactive Daycare Tasks Board**: Kanban-style board (Pending, In Progress, Completed) to track sensory play prep, sanitation, and meal services.
- **Reports & Analytics**: Custom date-range logs for attendance audits and staff performance scoring, with fully functional CSV downloads.
- **AI-Powered Core Modules**:
  - **Auto Duty Allocation**: Matches active available staff with classrooms based on capacity constraints and leave logs.
  - **Staff Shortage Alerts**: Notifies center heads on the dashboard if any active classroom is missing a lead teacher or helper today.
  - **Workload Scorecard**: Flags overloaded educators based on outstanding task weights and deadlines to prevent burn-out.
  - **Shift Suitability suggestions**: Recommends optimal shifts for staff members based on punctuality history.

---

## 📂 Repository Structure

```
Staff Attendance & Duty Roster/
├── database/
│   └── schema.sql                # Production MySQL DDL script & seeds
├── backend/
│   ├── package.json              # Express dependencies
│   ├── server.js                 # Entry point, port 5000
│   ├── config/db.js              # Persistence JSON database engine
│   ├── controllers/              # REST controllers (auth, staff, attendance, tasks)
│   ├── routes/                   # Router maps
│   └── middleware/               # JWT & RBAC interceptors
├── frontend/
│   ├── package.json              # Vite + React configs
│   ├── index.html                # App wrapper
│   └── src/
│       ├── main.jsx              # React mounting root
│       ├── index.css             # Styling rules & custom variables
│       ├── App.jsx               # Layout router shell
│       ├── components/           # Reusable widgets (KPI, custom charts, Modals)
│       └── pages/                # Screen layouts
├── demo-launcher.html            # Standalone single-file client bundle
└── index.html                    # Root browser portal
```

---

## 🚀 Getting Started

### 1. Offline Standalone Mode (No Setup Required)
To explore the application immediately without installing Node or configuring databases:
- Simply double-click **`index.html`** or **`demo-launcher.html`** in your browser.
- Use the **Quick Login** buttons on the login page to access the system as any role.

### 2. Full-Stack Local Servers
Once Node.js is installed on your machine:

**Backend Server:**
```bash
cd backend
npm install
npm start
```
*Port: http://localhost:5000*

**Vite Frontend Dev:**
```bash
cd frontend
npm install
npm run dev
```
*Port: http://localhost:5173*
*(The web portal will automatically connect to the Express server API when launched).*

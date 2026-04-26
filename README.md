# Mini ERP - Project Management System

A full-stack MERN ERP-style project management system with role-based access control.

## 🚀 Live Demo
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.onrender.com

## 🛠 Tech Stack
- **Frontend:** React, React Router, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT

## 👥 Roles
| Role | Permissions |
|------|------------|
| Admin | Full access — manage all projects, tasks, users |
| Manager | Create/manage projects & tasks, add members |
| Developer | View assigned projects, update task status, add comments |

## 📦 Setup

### Backend
```bash
cd backend
npm install
# Create .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_secret
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 Deployment
- Backend deployed on **Render**
- Frontend deployed on **Vercel**

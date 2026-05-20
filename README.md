# SpamShield — Decoupled Spam Detection System

A professional web application for detecting spam keywords in email content using the optimized **Boyer-Moore-Horspool String Matching Algorithm**.

---

## 🛠️ Tech Stack & Architecture

This repository is organized as a decoupled monorepo:

### 1. Frontend (`/frontend`)
* **Core:** React, Vite, TypeScript
* **Styling & Animations:** TailwindCSS, Framer Motion
* **Visualization:** Chart.js, Canvas (Matrix falling code background)
* **Hosting:** Designed for **Vercel**

### 2. Backend (`/backend`)
* **Core:** Node.js (Express), TypeScript
* **Database Client:** Mongoose
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt password hashing
* **Hosting:** Designed for **Render** / **Render Web Service**

### 3. Database Layer
* **Database:** **MongoDB Atlas** (Cloud Relational Relational/Document Database)

---

## ⚙️ Local Development Setup

### Prerequisite Environment Variables

#### Backend (`/backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
PORT=3000
MONGODB_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="your_secure_jwt_secret"
```

#### Frontend (`/frontend/.env`)
Create a `.env` file inside the `frontend` folder:
```env
VITE_API_URL="http://localhost:3000"
```

---

### Step-by-Step Execution

1. **Start the Backend API:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend API will listen at `http://localhost:3000`.

2. **Start the Frontend Client:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The Vite React dev server will spin up at `http://localhost:5173`.

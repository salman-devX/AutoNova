# 🔧 AutoNova — Car Service Center Management System

A full-stack workshop management and vehicle service booking platform (codename **AutoHubX**) built for real-world auto workshops. Customers can register vehicles, book service appointments, and track every stage of their car's service journey — while staff get dedicated dashboards to run the whole workshop pipeline from booking to invoice.

## 🌐 Live Demo

**[Visit AutoNova](https://autonova-mqva40zy0-salman-e4ab.vercel.app/)**

Backend API: `https://autonova-glrg.onrender.com`

> Note: the backend is on Render's free tier, so the first request after inactivity may take 30–60 seconds to wake up.

## ✨ Features

* 🔐 Real authentication — email/password + Google Sign-In (Firebase Auth)
* 📅 Real-time appointment booking with live slot availability
* 🚗 Customer vehicle registration and management
* 🧾 Full workshop pipeline: Booked → Vehicle Received → Inspection → In Progress → Quality Check → Ready for Pickup → Completed
* 🔍 Digital vehicle inspection checklists (engine, brakes, tires, battery, and more)
* 📦 Parts & inventory tracking with stock-level alerts and full audit trail
* 🧮 Automatic invoice generation with tax calculation and payment recording
* 🔔 In-app notifications for customers and staff
* 👥 Role-based dashboards: Admin, Receptionist, Mechanic, Customer
* 🏢 Multi-workshop-ready data model with per-workshop settings and working hours
* 🛡️ Bot protection on registration (Cloudflare Turnstile) and email notifications (Resend)

## 👥 User Roles

| Role         | Access                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| Customer     | Register vehicles, book appointments, track service history, pay invoices |
| Receptionist | Manage appointments, start service orders, generate invoices, front desk |
| Mechanic     | View assigned jobs, update job status, record vehicle inspections       |
| Admin        | Manage workshops, staff, services, inventory, and workshop settings     |

Any self-registered account (email/password or Google) defaults to the **customer** role. Staff accounts (admin, receptionist, mechanic) are provisioned separately by an admin.

## 🛠️ Tech Stack

### Frontend

* React + Vite
* React Router
* React Hook Form
* Recharts (dashboard charts)
* Firebase JS SDK (Authentication)

### Backend

* Node.js + Express 5
* MongoDB Atlas + Mongoose (replica set — required for transactional booking/inventory/invoice logic)
* Firebase Admin SDK (auth verification + staff account provisioning)
* Cloudinary (image uploads)
* Cloudflare Turnstile (bot protection)
* Resend (transactional email)

## 📁 Project Structure

```text
autohubx-monorepo/
├── backend/
│   └── Express API + MongoDB (Mongoose models, controllers, routes)
│
├── frontend/
│   └── React + Vite application
│
├── package.json
└── README.md
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/salman-devX/AutoNova.git
cd AutoNova
```

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Configure environment variables

Copy `.env.example` to `.env` in both `backend/` and `frontend/`, and fill in your own MongoDB Atlas, Firebase, Cloudinary, Turnstile, and Resend credentials.

### 4. Seed the fixed staff accounts

```bash
npm run seed:staff
```

This creates real Firebase + MongoDB accounts for the admin, receptionist, and mechanic roles.

### 5. Start the development environment

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## 🔐 Environment Variables

Create the required `.env` files using the provided `.env.example` files in `backend/` and `frontend/`.

Never commit sensitive credentials or secrets such as:

```text
MONGODB_URI
FIREBASE_PRIVATE_KEY
TURNSTILE_SECRET_KEY
RESEND_API_KEY
```

## 🚀 Deployment

* **Frontend** is deployed on [Vercel](https://vercel.com)
* **Backend** is deployed on [Render](https://render.com)

For production, make sure to:

* Set `FRONTEND_URL` on the backend to the deployed frontend's URL (for CORS)
* Set `VITE_API_URL` on the frontend to the deployed backend's `/api` URL
* Add the production domain to Firebase Authentication's authorized domains
* Allow the deployment's outbound IPs (or `0.0.0.0/0`) in MongoDB Atlas Network Access

## 🎯 Purpose

This project demonstrates a real-world full-stack application: real authentication, a transactional booking system, a multi-role staff pipeline, and inventory/billing — built as a genuine, production-style workshop management system rather than a demo.

## 👨‍💻 Developer

**Salman Ahmad**

Web Developer • Software Developer

### 🔗 Links

* 🌐 Live Website: https://autonova-mqva40zy0-salman-e4ab.vercel.app/
* 🐙 GitHub: https://github.com/salman-devX

## 📄 License

This project is created and maintained by Salman Ahmad.

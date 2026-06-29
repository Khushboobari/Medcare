# MedCare - Advanced Online Pharmacy Store

MedCare is an advanced, premium, full-stack medical store application built with React, Node, Express, and MongoDB. 

## Features
1. **Home Page**: Features a 3D animated capsule/pill logo, particle background decoration, dynamic stat counters, categories panel, monsoon coupon discount tags, and popular medicine cards.
2. **Medicines Catalog / Shop**: Real-time catalog search with sliders, categories, prescription requirement (Rx), and discount percentage filters.
3. **Medicine Detail**: In-depth medical salt information, uses, side-effects, substitutes recommendations (cost-effective identical salt formulas), and review submission forms.
4. **Interactive Carts**: Modifies item quantities, validates the promo coupon `MEDCARE30` (10% off), and dynamically computes delivery fees and GST rates (18% for devices, 12% for medicines).
5. **Checkout Gateway**: Manages delivery addresses (loads pre-saved ones) and payment modes (Card, UPI, COD) with **integrated Doctor Prescription uploading**.
6. **Order Route Stepper**: Renders status indicators (Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered) with delivery time estimates.
7. **Prescriptions Vault**: Handles drag-and-drop uploads for JPG, PNG, and PDF, keeping a complete history log.
8. **Drug Interaction Checker**: Matches two medicine names against active chemical salts and returns warnings or warnings about severe clinical conflicts.
9. **Symptom OTC Matcher**: Allows choosing symptoms (such as Fever, Acidity, Cough) and suggestions for safe over-the-counter wellness remedies.
10. **Intake Alarms Reminders**: Users can configure alarms by daily slot (Morning, Afternoon, Night) and trigger native **browser notifications** dynamically.
11. **User Profile**: Edit allergies lists, register family members, log multiple addresses, and click **"Re-order"** on order history logs.
12. **Admin Portal**: sidebar navigation, Recharts gross revenue charts, low-stock warnings tracker (stock < 10), prescription approval queues, and order status steppers.
13. **Brevo OTP & Google Login**: Secure login with simulated fallbacks for development out-of-the-box.

---

## Folder Architecture
```
├── backend/
│   ├── config/db.js          # Mongoose DB connection
│   ├── controllers/          # Authentication OTP and Google OAuth rules
│   ├── data/seed.js          # Database seed script for 22 medicines
│   ├── middleware/           # JWT verification and Multer file uploads
│   ├── models/               # Schemas (User, Medicine, Cart, Order, Rx, Alarms)
│   ├── routes/api.js         # API routes
│   └── server.js             # Entrypoint
└── frontend/
    ├── src/
    │   ├── components/       # Sticky Navbar, Footers, Loaders, Toasts
    │   ├── context/          # Global state (Cart, Auth, Theme, notifications)
    │   ├── pages/            # 13 page components
    │   ├── App.jsx           # Routing Switchboard
    │   └── main.jsx          # Render script
    ├── tailwind.config.js    # Custom themes (Mint green #00D4AA, Deep blue #0066FF)
    └── vite.config.js        # Compiles React and Proxies /api to Port 5000
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017/medcare`

### Installation
Clone or navigate to the project directory:

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Seed the database (Seeds 22 detailed medicines)**:
   ```bash
   npm run seed
   ```

3. **Start the API Server (Runs on port 5000)**:
   ```bash
   npm run dev
   ```

4. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Frontend Dev Server (Runs on port 3000)**:
   ```bash
   npm run dev
   ```

Open your browser and navigate to: `http://localhost:3000`

---

## Environment Variables (.env Configurations)

Create a `backend/.env` file with:
```env
MONGO_URI=mongodb://127.0.0.1:27017/medcare
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@medcare.com
PORT=5000
```
*Note: If no Brevo API Key or Google Client IDs are provided, the system defaults to dev simulations (e.g. printing OTP codes directly to the backend terminal log so you can copy and verify them immediately).*

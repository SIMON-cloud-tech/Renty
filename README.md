# Renty — Rental Marketplace, House Listings & Secure Payment Platform

**Status:** Production-ready | **Version:** 1.0.0 | **Last Updated:** September 2026

Renty is a full-stack rental platform built for a modern housing marketplace. Clients can browse available homes, visit listings, reserve units, and pay securely through the platform using M-Pesa-based rental payment flows. The system includes public property pages, role-based dashboards for landlords and business users, payment tracking, and operational analytics for rental management.

This README explains how the app works for clients and landlords, how the rental flow is managed, how to run the project locally, and how the payment and API architecture are organized.

---

## 1. What Renty Does

Renty is built around a simple rental lifecycle:

- A client browses available houses by location, property type, and rent range.
- A client can view a listing, check the details, and arrange a visit or contact the landlord.
- A client can reserve a unit and start the payment flow.
- The platform validates availability and secures the unit temporarily.
- The landlord and business admin can review and manage the transaction.
- The platform keeps a record of each payment, status change, and rental outcome.

### Primary user roles

- **Client:** searches for homes, reserves units, and pays for the rental.
- **Landlord:** manages units, reviews interest, and receives approved payouts.
- **Business/Admin:** oversees listings, clients, payment flow, and rental operations.

---

## 2. The Renty Rental Flow

This is the main customer journey supported by the platform:

1. A client visits the platform and browses available rental homes.
2. They select a property, review the unit details, and may arrange a viewing or contact the landlord.
3. If the client is interested, they start the rental flow from the listing page.
4. The backend checks whether the unit is still available and reserves it briefly to prevent double-booking.
5. The platform creates a payment record and sends a payment request to the client's M-Pesa number.
6. Once the payment is confirmed, the system marks it as paid and keeps it in the validation flow.
7. After move-in confirmation or final approval, the payment is released to the landlord and the transaction is recorded as complete.

This flow is designed to protect both sides:

- the client is not sending money to an unavailable property
- the landlord is protected from a listing being reserved without a valid payment trail
- the business can track the lifecycle of each reservation and payment

---

## 3. Key System Features

- **Property marketplace:** listing cards, search, filtering, and detailed unit pages
- **House management:** create, update, and remove rental listings
- **Client booking flow:** reserve a property and trigger a payment request
- **M-Pesa payment processing:** payment initiation and payment status tracking
- **Landlord payment view:** monitor payments tied to their listings
- **Admin dashboards:** manage listings, clients, landlords, and platform records
- **Chatbot support:** knowledge-based assistant for common rental enquiries
- **Analytics:** monitor leads, unit activity, payment flow, and platform performance
- **Media handling:** image uploads through Cloudinary
- **Email and OTP flows:** password reset and account-related communication

---

## 4. Platform Structure

The application is split into a public frontend, a backend API, and multiple role-based management areas.

### Frontend

The client-facing UI is built with React + Vite and provides the rental marketplace experience.

### Backend

The backend is built with Node.js + Express and stores most operational data in MongoDB.

### Role-based modules

The app includes separate API sections for:

- public home and property pages
- business dashboard operations
- landlord operations
- client rental and payment operations
- webhook handling for payment callbacks
- analytics endpoints

This separation helps keep the rental logic organized and reduces operational risk between user roles.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT with cookie-based session handling |
| Payment | M-Pesa / Daraja-style STK integration |
| Media | Cloudinary |
| Email | Resend / nodemailer |
| Security | express-rate-limit, route-level auth checks |
| Dev tooling | nodemon, concurrently |

---

## 6. Main Application Flow

### Public side

- users browse houses
- users inspect property details and landlord information
- users make enquiries or contact the platform

### Client side

- client profile is completed
- unit is reserved
- payment request is initiated
- payment status is monitored and updated

### Landlord side

- landlord manages units
- landlord reviews rental interest and payment activity
- landlord receives approved payouts after the relevant workflow completes

### Business side

- manages listings and records
- reviews clients and landlord data
- monitors analytics and operational trends
- handles cancellations and payment-related business processes

---

## 7. Repository Layout

```text
Renty/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── client/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json
├── Dockerfile
├── render.yaml
├── README.md
└── cookies.txt
```

The app is separated into a client UI and backend API to keep the rental workflow maintainable and scalable.

---

## 8. Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or via MongoDB Atlas
- M-Pesa/Daraja payment credentials for live payment flows

### Install dependencies

From the project root:

```bash
npm install
cd client && npm install
cd ../backend && npm install
cd ..
```

### Run locally

From the root:

```bash
npm run dev
```

This starts the frontend and backend together through the root script.

If you want to run them separately:

```bash
cd client && npm run dev
cd backend && npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

The backend usually runs on:

```text
http://localhost:5000
```

---

## 9. Environment Variables

Create a `.env` file inside the `backend` folder before starting the app.

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/renty
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=2547XXXXXXXX
RESEND_API_KEY=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Variable notes

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs authentication tokens |
| `CLIENT_URL` | Recommended | Frontend origin used by CORS and cookies |
| `CLOUDINARY_*` | Yes for uploads | Stores listing images |
| `RESEND_API_KEY` | Yes for email flows | Sends OTP and account emails |
| `VITE_WHATSAPP_NUMBER` | Optional | Used for direct WhatsApp/contact links |
| `PORT` | Optional | Defaults to 5000 |

---

## 10. How the Payment Flow Works in Renty

The project includes a transaction flow designed around rental reservation and fund protection.

### Payment lifecycle

1. A client chooses a house.
2. The unit is checked for availability.
3. The unit is reserved for a short period so it is not double-booked.
4. A `Payment` record is created in the database.
5. The backend calls the payment provider to initiate an M-Pesa STK push or payment request.
6. The provider confirms the payment asynchronously through a webhook.
7. The payment status updates from pending to paid.
8. The client confirms or approves the payout flow when the move-in condition is met.
9. The landlord receives the approved payout.

### Backend implementation notes

The actual flow is handled in these modules:

- `backend/controllers/clientPaymentController.js`
- `backend/controllers/landlordPaymentController.js`
- `backend/utils/mpesaUtil.js`
- `backend/utils/paymentsUtil.js`
- `backend/routes/clientRentRoutes.js`
- `backend/routes/clientPaymentRoutes.js`
- `backend/routes/webhookRoutes.js`
- `backend/models/Payment.js`

The reservation logic ensures that a property is not accidentally sold twice while a client is confirming payment.

---

## 11. Public and Protected Routes

### Public rental routes

These routes expose the marketplace to the public.

Examples:

- `GET /api/houses/search`
- `GET /api/houses/units`
- `GET /api/houses/units/all`
- `GET /api/houses/units/:id`
- `GET /api/houses/units/landlord/:landlordId`

### Client routes

Protected routes for signed-in clients.

Examples:

- `POST /api/client/rent`
- `GET /api/client/payments`
- `GET /api/client/payments/:paymentId/status`

### Landlord routes

Examples:

- `GET /api/landlord/payments`
- `GET /api/landlord/units`
- `GET /api/landlord/clients`

### Business routes

Examples:

- `GET /api/business/units`
- `GET /api/business/clients`
- `GET /api/business/landlords`
- `GET /api/business/cancellations`

### Webhook route

- `POST /api/webhooks`

This is used to receive payment confirmations and update the payment state in the system.

---

## 12. API Overview

### Auth

- `POST /api/register`
- `POST /api/login`
- `GET /api/profile`
- `POST /api/logout`
- `POST /api/reset/request`
- `POST /api/reset/confirm`

### Houses / listings

- `GET /api/houses/search`
- `GET /api/houses/units`
- `GET /api/houses/units/all`
- `GET /api/houses/units/:id`
- `POST /api/houses`
- `PUT /api/houses/:id`
- `DELETE /api/houses/:id`

### Client payment flow

- `POST /api/client/rent`
- `GET /api/client/payments/:paymentId/status`
- `GET /api/client/payments`

### Landlord payment data

- `GET /api/landlord/payments`

### Analytics

- `/api/analytics/blogs`
- `/api/analytics/bot`
- `/api/analytics/guides`
- `/api/analytics/leads`

---

## 13. Business and Admin Use Cases

Renty is not only a listing app; it is also an operational management system.

Typical admin tasks include:

- add and update rental units
- manage landlord profiles
- review client leads and enquiries
- supervise payment records and payout states
- review complaints and cancellations
- monitor analytics and property performance
- maintain chatbot knowledge content

This makes the platform suitable for a real rental business that needs a single operational layer for both the public marketplace and internal management.

---

## 14. Security & Production Notes

- JWT tokens are stored in secure cookies when used in browser sessions.
- Route-level access checks ensure protected endpoints are only available to authorized users.
- Sensitive routes are protected by authentication and role enforcement.
- Payment routes are guarded by role restrictions so only valid client or landlord flows are allowed.
- The app is designed to run behind a trusted reverse proxy environment such as Render while preserving correct `req.ip` and rate limiting behavior.
- Server startup will fail without critical environment variables such as MongoDB and JWT configuration.

### Recommended production practices

- use HTTPS in production
- set secure cookie settings for hosting behind proxies
- protect payment credentials and provider secrets
- test webhook callbacks in staging before production release
- review logs and payment states regularly

---

## 15. Deployment

The project includes Docker and Render configuration files for deployment.

Typical deployment flow:

1. configure environment variables in the host
2. ensure MongoDB is reachable from the deploy environment
3. configure payment credentials and webhook URLs
4. build the frontend and serve the backend appropriately
5. deploy and test the live rental flow end to end

---

## 16. Summary

Renty is a rental marketplace and operations platform built to manage the full lifecycle of a property transaction:

- discovery
- visit arrangement
- reservation
- secure payment
- owner payout
- operational oversight

The project combines a public-facing property marketplace with business logic for clients, landlords, and platform staff, and it is structured to support a real rental business rather than a simple static listing site.

---

## 17. Contact & Support

For support, customization, or deployment questions, contact the maintainer:

- **Name:** Simon Mbithi
- **Email:** simonmbithi143@gmail.com
- **Phone:** +254 703 433 014
- **GitHub:** [github.com/SIMON-cloud-tech](https://github.com/SIMON-cloud-tech)

If you want to extend the platform further, the most natural next improvements are:

- richer rental filters and saved searches
- landlord onboarding workflow
- stronger payout approval dashboard
- automated reminders and move-in confirmations
- more advanced analytics and reporting

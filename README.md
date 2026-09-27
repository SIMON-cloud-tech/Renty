# Renty — Rental Marketplace & Payment Flow Platform

**Status:** Production-ready | **Version:** 1.0.0 | **Last Updated:** September 2026

Renty is a full-stack rental marketplace that helps clients discover available homes, visit listings, reserve a unit, and pay securely for a rental through the platform. It combines a React + Vite frontend with an Express + MongoDB backend and a role-based admin dashboard for landlords and operations.

This README is written to: (a) explain how Renty works for clients and landlords, (b) show developers how to run and deploy the platform, and (c) document the API and the payment flow.

---

## 1. What This Product Does (Client-Focused)

- Public property listing experience for searching homes by location, budget, and type.
- Client-facing flow for viewing available units, contacting landlords, and arranging a visit.
- Rental reservation and payment initiation using the platform's secure M-Pesa flow.
- Admin and landlord dashboards for managing units, leads, payments, and property records.
- Escrow-style handling for rental funds so the money is protected while the unit is being confirmed.
- Image uploads and property media storage via Cloudinary.
- Transactional notifications and analytics for leads, enquiries, and payment activity.

**Why clients choose Renty:**
- **Simple property search** — clients can browse available homes instead of chasing listings manually.
- **Trust-first rental process** — the platform holds funds during the onboarding and move-in confirmation period.
- **Clear payment journey** — clients can reserve, pay, and track their rental status from one place.
- **Operationally easier** — landlords and admins manage listings and payments without custom code.

### 1.1 How a client visits, rents, and pays for a house on Renty

The rental journey on Renty is designed to be simple and safe for both the client and the landlord:

1. A client visits the Renty platform and browses available houses by location, house type, rent range, and other criteria.
2. They choose a property they like, review details, and can contact the landlord or arrange a physical visit through the platform workflow.
3. If the client wants the house, they start the rental process from the property page. The backend verifies the unit is still vacant and reserves it for a short time to prevent double-booking.
4. The system creates a payment record and triggers a payment request using the client's M-Pesa phone number. This is where the house is effectively being secured while the client completes the transaction.
5. Once the M-Pesa prompt is confirmed, the payment is marked as paid and waits for the final approval flow. The funds are held in a protected flow until the move-in is confirmed.
6. After the client confirms the property and the landlord completes the handover, the payment can be released to the landlord, while the platform keeps the payment trail and account status transparent.

This flow protects both sides: the client is not paying into a questionable listing, and the landlord is protected from a unit being reserved without a valid payment trail.

---

## 2. Key Features (Technical Highlights)

- **Public rental marketplace:** property listings, location-based filtering, and house detail pages for clients searching for homes.
- **Landlord & admin dashboard:** full CRUD for units, landlord profiles, leads, payments, and bot knowledge.
- **Authentication:** cookie-based JWT auth for secure client, landlord, and admin access.
- **File uploads:** image upload middleware with Cloudinary integration for listing photos.
- **Chatbot:** public chat endpoint using a DB-backed knowledge base; records unanswered questions for later review and improvement.
- **Analytics:** protected endpoints for overview metrics and property-specific analytics for leads, units, and payment activity.
- **Payments:** M-Pesa-style payment flows for reservations and rental confirmations, with protected payout handling.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Recharts (analytics), React Helmet Async (SEO) |
| Backend | Node.js, Express, Mongoose |
| Data store | MongoDB |
| Media | Cloudinary |
| Email | Resend (`resend` package) |
| Authentication | JWT (httpOnly cookie) |
| Dev tools | Vite, nodemon, concurrently |

---

## 4. Architecture Notes

### Admin dashboard structure
The dashboard (`frontend/src/components/dashboard/jsx/Dashboard.jsx`) is a single shell that swaps sections dynamically via a menu map, making it straightforward to extend by adding new entries:

```js
const MENU_ITEMS = [
  { id: 'products', label: 'Product Management' },
  { id: 'blog', label: 'Blog Management' },
  { id: 'guide', label: 'Inspiration Guides' },
  { id: 'bot', label: 'Bot Knowledge' },
  { id: 'leads', label: 'Customer Leads' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'testimonials', label: 'Testimonials' },
  {
    id: 'analytics',
    label: 'Analytics',
    children: [
      { id: 'analytics-overview', label: 'Overview' },
      { id: 'analytics-products', label: 'Products' },
      { id: 'analytics-leads', label: 'Leads' },
      { id: 'analytics-blogs', label: 'Blogs' },
      { id: 'analytics-guides', label: 'Guides' },
      { id: 'analytics-bot', label: 'Bot' },
    ]
  },
];

const COMPONENT_MAP = {
  products: ProductManage,
  blog: BlogManage,
  guide: GuidesManage,
  bot: Bot,
  leads: Lead,
  inventory: Inventory,
  testimonials: TestimonialsManage,
  'analytics-overview': AnalyticsOverview,
  'analytics-products': ProductAnalytics,
  'analytics-leads': LeadAnalytics,
  'analytics-blogs': BlogAnalytics,
  'analytics-guides': GuideAnalytics,
  'analytics-bot': BotAnalytics,
};
```

### Route-level auth guard
```jsx
<Route
  path="/dashboard/*"
  element={
    isAuthenticated ? <Dashboard setUser={setUser} /> : <Navigate to="/admin" replace />
  }
/>
```

### Public storefront
Organized around browsing and conversion: product listing and category filters, detail pages with features and pricing, browser-persisted cart, WhatsApp-based sales flow, blog/guide marketing sections, testimonial display, and the chatbot widget for support and product discovery.

### Performance & UX optimizations
- **Memoization** — `useMemo`, `useCallback`, and `React.memo` where it reduces unnecessary rerenders.
- **Lazy image loading** — `loading="lazy"` on product and content images.
- **Progressive loading** — `IntersectionObserver` for list-heavy UI, rendering more items only as needed.
- **Local cart persistence** — browser storage avoids refetching and reduces friction on refresh.
- **Cloudinary-offloaded media** — upload-heavy content doesn't burden the app server.
- **Dynamic SEO metadata** — `react-helmet-async` sets page titles/metadata per public page.

---

## 5. Quick Start — Run Locally

**Prerequisites:** Node.js 18+, npm, MongoDB (Atlas or local)

```bash
# from repository root
npm install
cd frontend && npm install && cd ../backend && npm install && cd ..
```

Root `package.json` runs both apps together:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\""
  }
}
```

```bash
npm run dev
```

This runs the frontend via Vite on `http://localhost:5173` and the backend via `nodemon server.js` on `http://localhost:5000`.

To run either individually:
```bash
cd frontend && npm run dev   # frontend only
cd backend && npm run dev    # backend only
```

The project is deployed on Render and can be configured for production hosting through the root app and backend environment settings.

## 6. Environment Variables

Create a `.env` in `backend/`:

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

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes — server exits without it | MongoDB connection string |
| `JWT_SECRET` | Yes — server refuses to start without it | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Yes, for uploads | Cloudinary credentials |
| `RESEND_API_KEY` | Yes, for email | Transactional email (OTP/reset) delivery |
| `NODE_ENV` | Recommended | `development` or `production` — affects cookie settings and CORS |
| `PORT` | Optional (default 5000) | Backend port |
| `VITE_WHATSAPP_NUMBER` | Optional | Exposed via `/api/config` for frontend contact links |

---

## 7. Build & Deploy

- **Frontend:** `cd frontend && npm run build` — output can be served by any static host (Netlify, Vercel, S3) or from the backend's `public/` folder.
- **Backend:** set `NODE_ENV=production`, configure environment variables, run via `npm start`, PM2, systemd, or Docker.
- The server is configured to serve the built frontend from `backend/public` in production.
- A `Dockerfile` is present at the repo root — adapt for multi-stage builds serving both apps from a single container.

---

## 8. API Reference (High-Level)

Base: `/api`

**Auth**
- `POST /api/register` — create the single admin account (allowed once only)
- `POST /api/login` — login, returns httpOnly cookie
- `GET /api/profile` — authenticated admin profile (protected)
- `POST /api/logout` — clear auth cookie

**Inventory**
- `GET /api/inventory` / `GET /api/inventory/:id` — public
- `POST` / `PUT` / `DELETE /api/inventory/:id` — protected, `POST` accepts `multipart/form-data` with image

**Blogs**
- `GET /api/blogs` / `GET /api/blogs/:id` — public
- `POST` / `PUT` / `DELETE /api/blogs/:id` — protected
- `POST /api/blogs/:id/view` — increments view counter for analytics

**Leads**
- `POST /api/leads` — public submission
- `GET /api/leads`, `GET /api/leads/:id`, `GET /api/leads/stats` — protected

**Chatbot**
- `POST /api/bot/chat` — public, takes `message`, returns `reply`
- `/api/bot` — protected CRUD for bot knowledge and unanswered-question management

**Analytics**
- `GET /api/analytics/overview` and further endpoints under `/api/analytics/*` for products, leads, blogs, guides, bot — all protected

Implementation details live in `backend/routes/*` and `backend/controllers/*`.

---

## 9. Integrations

- **Cloudinary** — image uploads and serving (`backend/utils/cloudinary.js`), environment-driven credentials.
- **Resend** — transactional email delivery (`backend/utils/sendEmail.js`), used for OTP/resets.
- **WhatsApp (optional)** — frontend reads `VITE_WHATSAPP_NUMBER` from `/api/config` for a direct contact link.

---

## 10. Security & Best Practices

- JWT stored in an httpOnly cookie to reduce XSS risk.
- `authMiddleware` accepts a Bearer token in the `Authorization` header for API clients, with cookie fallback for browser sessions, and is route-scoped rather than global.
- Rate limiting on sensitive endpoints (login, register) via `express-rate-limit` to mitigate brute-force attacks.
- Server refuses to start without `MONGODB_URI` and `JWT_SECRET`, preventing insecure defaults.

**Recommended for production:**
- Use HTTPS; set `NODE_ENV=production` to enable secure cookies and `sameSite: none` for cross-site cookie delivery behind trusted proxies.
- Use a strong, rotated `JWT_SECRET`.
- Monitor and rate-limit `RESEND_API_KEY` usage.

---

## 11. Design Decisions Worth Preserving

- JWT auth is cookie-based, not localStorage-based.
- Public and admin routes are intentionally split.
- `authMiddleware` is route-scoped, not global.
- Product uploads are handled as multipart form data, sent to Cloudinary.
- Frontend components fetch from the backend rather than embedding business data directly.
- MongoDB is the source of truth for content and catalog persistence — the frontend is a consumer of the API, not a source of durable data.

---

## 12. Admin / Business Workflows

- Manage the product catalog: images, pricing, sale status, features, categories.
- Publish SEO-focused blog posts and guides to attract customers.
- Review and act on leads directly from the dashboard.
- Maintain the chatbot by answering unanswered questions, making it smarter over time.
- Monitor analytics to see which products and content drive leads.

---

## 13. Extension Points

- Add new product taxonomy values in `Products.js`.
- Add new admin dashboard sections by updating the menu and component map in `Dashboard.jsx`.
- Expose new public pages via routes in `App.jsx`.
- Add new controllers/routes under the appropriate domain folder.
- Add new analytics endpoints following the existing analytics route/controller pattern.

---

## 14. Notes for Maintainers

- The backend is the source of truth for product and data changes.
- Because content is stored in MongoDB, the site is easier to maintain long-term than a static HTML-only build.
- The admin dashboard must remain behind auth checks at both the route and controller level.
- Any changes to auth cookies, `trust proxy`, or CORS behavior should be tested carefully in production-like hosting environments before deploying.

---

## 15. Summary

This repository is best understood as a **commerce + CMS application**, not a simple storefront. The public site is customer-facing and sales-oriented; the dashboard is the operational control plane for content and business processes. The backend is domain-driven, MongoDB-backed, and the frontend consumes it through a clean API boundary. Core concepts to remember when working in this codebase: public vs. protected route separation, cookie-based JWT auth, API-first data flow, Cloudinary-backed media, MongoDB-driven content, and dashboard components built for real operational workflows.

---

## 📞 Contact & Support

For support, customization, or business inquiries, contact the maintainer directly:

- **Name:** Simon Mbithi
- **Email:** simonmbithi143@gmail.com
- **Phone:** +254 703 433 014 (Kenya)
- **GitHub:** [github.com/SIMON-cloud-tech](https://github.com/SIMON-cloud-tech)

Found a bug or have a feature request? Open an issue on the GitHub repository.

If you'd like a production-deploy checklist, a `docs/` folder with API examples and a Postman collection, or a scaffolded payment/checkout flow, get in touch — the codebase is designed to be extended quickly for bespoke requirements.
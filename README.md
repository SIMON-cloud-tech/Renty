# FurniHaven — Full-stack Furniture CMS & Storefront

FurniHaven is a production-ready full-stack website combining a fast React + Vite storefront with an Express + MongoDB backend and a private admin dashboard. It is built for small furniture businesses who want a modern, content-driven online presence they can update without code.

This README is written to: (a) describe what the product does for potential clients, (b) show developers how to run and deploy it, and (c) document the API and integrations used.

---

## What this product does (client-focused)

- Provides a public storefront with product pages, categories, blog articles, and guides to drive organic search and conversions.
- Includes an admin dashboard (single-admin model) for editing products, blogs, guides, testimonials, and bot knowledge without developer involvement.
- Captures leads and contact enquiries and surfaces them in the dashboard for sales follow-up.
- Includes an embeddable support chatbot backed by a database-driven knowledge base that the business can maintain from the dashboard.
- Stores and serves images via Cloudinary for fast, CDN-backed image delivery.
- Sends transactional emails (OTP/reset) via Resend integration.
- Collects lightweight analytics for products, blogs, guides, and chatbot interactions to inform marketing decisions.

Why clients choose FurniHaven:
- Turn-key storefront + CMS: deploy quickly and manage content via a web dashboard.
- SEO-friendly: blog and guide features let you publish content that attracts qualified traffic.
- Customer-first: integrated chatbot, lead capture and testimonials build trust and reduce friction.

---

## Key Features (technical highlights)

- Public storefront: product listing, category filters, product detail pages, SEO-friendly blog posts and guides.
- Admin dashboard: CRUD for Products, Blogs, Guides, Testimonials, Leads, and Bot knowledge.
- Authentication: cookie-based JWT auth for secure dashboard access.
- File uploads: image upload middleware + Cloudinary integration.
- Chatbot: public chat endpoint that uses a DB-backed knowledge base and records unanswered questions for later review.
- Analytics: protected endpoints for overview metrics and model-specific analytics (products, leads, blogs, guides, bot).
- Password reset: OTP flow with email delivery via Resend.

---

## Technology Stack

- Frontend: React (Vite), React Router, Recharts (analytics), React Helmet (SEO)
- Backend: Node.js, Express, Mongoose
- Data store: MongoDB
- Media: Cloudinary
- Email: Resend (via `resend` package)
- Authentication: JWT (httpOnly cookie)
- Dev tools: Vite, nodemon, concurrently

---

## Quick Start — Run locally

Prerequisites:
- Node.js (18+ recommended)
- npm
- MongoDB (Atlas or local)

1. Install dependencies (root uses concurrently to run both apps):

```bash
# from repository root
npm install
# then install client and backend deps (if separate install needed):
cd client && npm install && cd ../backend && npm install && cd ..
```

2. Environment variables

Create a `.env` in `backend/` with the following keys (example values):

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/furnihaven
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
PORT=5000
VITE_WHATSAPP_NUMBER=254700000000
```

Notes:
- `JWT_SECRET` is required: server refuses to start without it.
- `MONGODB_URI` must be set or the server exits.

3. Run in development (root script runs both client and backend):

```bash
npm run dev
```

This runs:
- `client` via `vite` on `http://localhost:5173` (default)
- `backend` via `nodemon server.js` on `http://localhost:5000`

To run only backend:

```bash
cd backend
npm run dev
```

To run only frontend:

```bash
cd client
npm run dev
```

---

## Build & Deploy

- Frontend production build: `cd client && npm run build`. The build output can be served by any static host (Netlify, Vercel, S3, or the backend `public/` folder).
- Backend production: set `NODE_ENV=production`, configure environment variables and use `npm start` in `backend/` or run the bundled app with a process manager (PM2, systemd, Docker).
- The server is configured to serve the built frontend from `backend/public` when in production.

Docker: a `Dockerfile` is present at the repo root — adapt it to build both client and backend or use multi-stage builds for a single container serving the app.

---

## Environment variables (full list)

- `MONGODB_URI` — MongoDB connection string (required)
- `JWT_SECRET` — JWT signing secret (required)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials for image uploads
- `RESEND_API_KEY` — API key for Resend email delivery
- `NODE_ENV` — `development` or `production` (affects cookie settings and CORS)
- `PORT` — backend port (default 5000)
- `VITE_WHATSAPP_NUMBER` — (optional) exposed via `/api/config` for frontend contact links

---

## API Reference (high-level)

Base: `/api`

- `POST /api/register` — create the single admin account (only allowed once)
- `POST /api/login` — login (returns httpOnly cookie)
- `GET /api/profile` — read authenticated admin profile (protected via cookie)
- `POST /api/logout` — clear auth cookie

- `GET /api/inventory` — list products (public)
- `GET /api/inventory/:id` — product detail (public)
- `POST /api/inventory` — add product (protected) — accepts `multipart/form-data` with image
- `PUT /api/inventory/:id` — update product (protected)
- `DELETE /api/inventory/:id` — delete product (protected)

- `GET /api/blogs` — list blogs (public)
- `GET /api/blogs/:id` — blog detail (public)
- `POST /api/blogs` — create blog (protected)
- `PUT /api/blogs/:id` — update blog (protected)
- `DELETE /api/blogs/:id` — delete blog (protected)
- `POST /api/blogs/:id/view` — increment view counter for analytics

- `POST /api/leads` — submit a lead/contact (public)
- `GET /api/leads` — list leads (protected)
- `GET /api/leads/:id` — get single lead (protected)
- `GET /api/leads/stats` — lead metrics (protected)

- `POST /api/bot/chat` — public chat endpoint (consumes `message`) — responds with `reply`
- `/api/bot` (protected) — CRUD for bot knowledge and unanswered question management

- `GET /api/analytics/overview` — protected analytics overview
- Additional analytics endpoints under `/api/analytics/*` for products, leads, blogs, guides, bot

For implementation details see `backend/routes/*` and `backend/controllers/*`.

---

## Integrations

- Cloudinary — image uploads and serving (`backend/utils/cloudinary.js`). Environment-driven credentials.
- Resend — transactional email delivery (`backend/utils/sendEmail.js`). Used for OTP/resets.
- Optional SMS/WhatsApp integration — the frontend reads `VITE_WHATSAPP_NUMBER` from `/api/config`.

---

## Security & Best Practices

- JWT is stored in an httpOnly cookie to reduce XSS risk.
- `authMiddleware` accepts a Bearer token in `Authorization` header for API clients, with cookie fallback for browser sessions.
- Rate limits are applied to sensitive endpoints (login and register) to mitigate brute-force attacks (`express-rate-limit`).
- The server refuses to start without `MONGODB_URI` and `JWT_SECRET` to avoid insecure defaults.

Recommendations for production:
- Use HTTPS and set `NODE_ENV=production` to enable secure cookies and `sameSite: none` for cross-site cookie delivery behind trusted proxies.
- Use a robust secret for `JWT_SECRET` and rotate it responsibly.
- Restrict `RESEND_API_KEY` to limits and monitor email usage.

---

## Admin / Business workflows (what clients can do)

- Manage product catalog: add images, set price and status (sale/normal), add features and categories.
- Manage editorial: publish SEO-focused blog posts and guides to attract customers.
- Review and act on leads: contact potential buyers quickly from the dashboard.
- Maintain the chatbot: answer unanswered questions from the dashboard so the bot becomes smarter over time.
- Monitor performance: view analytics to learn which products and content drive leads.

---

## Contributing & Extending

This project is organized so developers can extend modules independently:
- Add new routes: `backend/routes/*` and corresponding controllers in `backend/controllers`.
- Add new models: `backend/models/*` using Mongoose schemas.
- Enhance the frontend: `client/src/components/*` and `client/src/pages/*` follow a modular layout.

If you want help customizing FurniHaven for your business (branding, payment integration, multi-admin support, or full deployment), get in touch — the codebase is designed to be extended quickly for bespoke requirements.

---

## Support & Contact

If you want a production setup, customizations, or a migration plan, contact the maintainer (project owner) for a commercial engagement. The system is shipped as a deployable starter kit that can be tailored and hosted for your business.

---

## Files to inspect for developers

- Backend server: [backend/server.js](backend/server.js)
- DB config: [backend/config/db.js](backend/config/db.js)
- Routes: [backend/routes](backend/routes)
- Controllers: [backend/controllers](backend/controllers)
- Frontend entry: [client/src/main.jsx](client/src/main.jsx)
- Frontend app routes: [client/src/App.jsx](client/src/App.jsx)

---

Thank you — FurniHaven is intended as a practical, deployable small-business platform that turns content into customers. If you'd like, I can also:
- Prepare a production-deploy checklist (Docker + environment + HTTPS)
- Add a `docs/` folder with API examples and Postman collection
- Scaffold payment integration and checkout flow

Tell me which of these you'd like next.

The dashboard in `frontend/src/components/dashboard/jsx/Dashboard.jsx` is a single shell that swaps sections dynamically via a menu map.

### Menu layout

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
```

### Component selection

```js
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

This makes the dashboard easy to extend by adding more entries to the menu and component map.

### Auth guard behavior

The route-level guard in `App.jsx` checks logged-in state before rendering the dashboard:

```jsx
<Route
  path="/dashboard/*"
  element={
    isAuthenticated ? <Dashboard setUser={setUser} /> : <Navigate to="/admin" replace />
  }
/>
```

This is a common pattern for a protected application shell.

---

## 9. Public storefront details

Public pages are organized around browsing and conversion:

- product listing pages and category filters
- detail pages with features and pricing
- cart persistence in browser storage
- WhatsApp-based sales flow
- blog and guide marketing sections
- customer testimonial display
- chatbot widget for support and product discovery

The design intentionally balances marketing content with commerce conversion.

---

## 10. Performance and UX details

The codebase includes multiple small but meaningful performance optimizations:

### Memoization
Components use `useMemo`, `useCallback`, and sometimes `React.memo` to reduce unnecessary rerenders.

### Lazy image loading
`loading="lazy"` is used on product and content images to reduce initial page weight.

### Progressive loading
`IntersectionObserver` is used for list-heavy UI to render more items only when needed.

### Local cart persistence
The cart is stored in browser storage to avoid refetching and to reduce friction during page refreshes.

### Cloudinary media
Upload-heavy content is offloaded to Cloudinary rather than burdening the app server with raw media storage.

### SEO metadata
`react-helmet-async` is used to set page titles and metadata dynamically for public pages.

---

## 11. Environment setup

### Root scripts

`package.json` at the project root defines:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\""
  }
}
```

This runs both frontend and backend in a single developer flow.

### Backend `.env` values

Minimum required configuration for local development:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/furnihaven
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=2547XXXXXXXX
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running locally

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
npm run dev
```

---

## 12. Known design decisions worth preserving

These are important implementation conventions that should be respected when making changes:

- JWT auth is cookie-based, not localStorage-based
- public and admin routes are intentionally split
- `authMiddleware` is route-scoped rather than global
- product uploads are handled as multipart form data and sent to Cloudinary
- frontend components fetch from the backend instead of embedding business data directly
- MongoDB drives content and catalog persistence

These patterns are central to the current application design.

---

## 13. Extension points

Developers can extend the codebase in a straightforward way:

- add new product taxonomy values in `Products.js`
- add new admin dashboard sections by updating the menu and component map in `Dashboard.jsx`
- expose new public pages by adding routes in `App.jsx`
- add new controllers and routes under the appropriate domain folder
- add analytics summary endpoints by following the existing analytics route/controller pattern

---

## 14. Notes for maintainers

- The backend is the source of truth for product and data changes.
- The frontend is a consumer of backend APIs, not a source of durable data.
- Because content is stored in MongoDB, the site is easier to maintain than a static HTML-only build.
- The admin dashboard should remain behind auth checks at both the route and controller levels.
- Any changes to auth cookies, `trust proxy`, or CORS behavior should be tested carefully in production-like hosting environments.

---

## 15. Summary

This repo is best understood as a commerce + CMS application rather than a simple storefront. The public website is customer-facing and sales-oriented, while the dashboard is the operational control plane for content and business processes. The backend is domain-driven, the database is MongoDB-backed, and the frontend consumes that data through a clean API boundary.

If you are working in this codebase, the main architectural concepts to remember are:

- public vs protected route separation
- cookie-based JWT auth
- API-first data flow
- Cloudinary-backed media
- MongoDB-driven content and catalog persistence
- dashboard components for operational workflows


# 📞 Contact & Support
- For support, custom development, or business inquiries, please  contact the maintainer directly.
  - Name: Simon Mbithi
  - Email: simonmbithi143@gmail.com
  - Phone: +254 703 433 014 (Kenya)
  - GitHub: https://github.com/SIMON-cloud-tech

# If you find a bug or have a feature request, please open an issue on the GitHub repository.

 # 🏗️ Project Status

- This project is currently stable and feature-complete as a deployable starter kit for a furniture business. It is ready for production hosting.
    - Current Version: 1.0.0
    - Status: Production-ready
    - Last Updated: August 2026
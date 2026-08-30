# FurniHaven

This project is a full-stack furniture commerce and CMS-style application for a home and office furniture brand. The repository combines a React + Vite frontend with an Express + MongoDB backend and a private admin dashboard for catalog management, lead tracking, blogging, guides, testimonials, and analytics.

This README is aimed at developers working on the codebase and should be treated as the technical overview for the application architecture and runtime behavior.

---

## 1. Project goals and domain model

The application is designed around a real small-business workflow:

- Sales and marketing happen on a public-facing storefront.
- Content is editable from an admin dashboard instead of hardcoded into the frontend.
- Product inventory and pricing live in MongoDB and are served through the API.
- Customer interest is captured through contact and lead submissions.
- Business decisions can be guided by analytics and content performance data.

The app is not just a landing page; it is a data-driven commerce + content platform.

---

## 2. Architecture overview

### Frontend
- React app with Vite
- Client-side routing in `frontend/src/App.jsx`
- Public layout in `frontend/src/layouts/PublicLayout.jsx`
- Storefront components in `frontend/src/components/landingpage/jsx/*`
- Dashboard components in `frontend/src/components/dashboard/jsx/*`

### Backend
- Node.js + Express API in `backend/server.js`
- Route modules under `backend/routes/*`
- Controller logic under `backend/controllers/*`
- Mongoose models under `backend/models/*`
- Middleware under `backend/middleware/*`
- Utility modules under `backend/utils/*`

### Data storage
- MongoDB via Mongoose
- Product, blog, guide, lead, testimonial, bot, and user documents are persisted in MongoDB collections
- Uploaded media is sent to Cloudinary for storage and delivery

---

## 3. Repository structure

```bash
Furnihaven/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── chatBotController.js
│   │   ├── inventoryController.js
│   │   ├── leadController.js
│   │   ├── resetController.js
│   │   ├── guidesController.js
│   │   ├── testimonialController.js
│   │   └── ...
│   ├── data/
│   │   └── chatbotknowledge.json
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Blogs.js
│   │   ├── Bot.js
│   │   ├── Guides.js
│   │   ├── Lead.js
│   │   ├── Products.js
│   │   ├── Testimonials.js
│   │   ├── User.js
│   │   └── otpStore.js
│   ├── routes/
│   │   ├── analyticsRoute.js
│   │   ├── authRoute.js
│   │   ├── blogRoute.js
│   │   ├── chatBotRoute.js
│   │   ├── dashboardRoute.js
│   │   ├── guideRoute.js
│   │   ├── inventoryRoute.js
│   │   ├── leadRoute.js
│   │   ├── resetRoute.js
│   │   ├── testimonialRoute.js
│   │   └── ...
│   ├── utils/
│   │   ├── chatBotParser.js
│   │   ├── cloudinary.js
│   │   ├── errorHandler.js
│   │   ├── sendEmail.js
│   │   └── uploadToCloudinary.js
│   ├── package.json
│   ├── seedAll.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── landingpage/
│   │   │   └── SEO/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── data/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── package.json
├── README.md
├── Dockerfile
├── cookies.txt
├── .gitignore
└── .env.example (if added later)
```

---

## 4. Runtime flow and data flow

### 4.1 Frontend boot sequence

The application bootstraps in `frontend/src/App.jsx`:

- App initializes `user` and `loading` state.
- It calls `/api/profile` with `credentials: 'include'` to validate the current session.
- If the response is successful, it sets the authenticated user.
- If not, it resets the auth state and renders the public or login flow.

This means the frontend is effectively session-aware, but it does not store the JWT in localStorage. Instead, the auth state is rehydrated via the cookie-backed API.

### 4.2 Public website rendering

Public pages are rendered under `PublicLayout`, which manages the cart state and persists it to `localStorage`.

In `frontend/src/layouts/PublicLayout.jsx`:

```jsx
const [cart, setCart] = useState(() => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
});
```

This is a deliberate UX choice: the cart survives refreshes without requiring a backend cart table for every user session.

### 4.3 Route separation

The React router splits the app into public routes and protected admin routes:

- Public routes include home, products, blogs, guides, about, contact, product category pages
- Protected routes include `/dashboard/*` and `/admin`
- A redirect is used when an unauthenticated user tries to access the dashboard

This is implemented in `frontend/src/App.jsx` with `Navigate` and conditional rendering.

### 4.4 Admin/auth flow

The auth flow is:

1. User visits `/admin`
2. `Auth.jsx` renders login/register form
3. Backend `/api/login` validates credentials
4. Server creates a JWT and stores it in an HTTP-only cookie
5. Frontend checks auth via `/api/profile`
6. Dashboard loads and displays protected modules

This is implemented using `authMiddleware.js` on the backend and JWT verification.

---

## 5. Backend API design

### 5.1 Route layering

The backend is domain-oriented instead of page-oriented:

- `authRoute.js` → auth-related requests
- `inventoryRoute.js` → products and catalog records
- `blogRoute.js` → blog content CRUD
- `guideRoute.js` → guides and inspiration content
- `leadRoute.js` → customer enquiry records
- `testimonialRoute.js` → testimonial management
- `chatBotRoute.js` → chatbot and knowledge entries
- `dashboardRoute.js` → protected admin info and dashboard-specific API
- analytic routes provide reporting endpoints

This keeps the API easier to reason about as the product grows.

### 5.2 Middleware responsibilities

#### `authMiddleware.js`
This middleware:

- reads the JWT from the `Authorization` header first
- falls back to the cookie token if the header is missing
- verifies the token with `JWT_SECRET`
- attaches `req.user` with `{ id, email }`
- rejects unauthorized requests with `401`

This protects dashboard actions and any admin-only endpoints.

#### `uploadMiddleware.js`
This handles file uploads and attaches the uploaded image to `req.file` so controllers can pass binary data to Cloudinary.

### 5.3 API protection model

Important pattern in the backend:

- public endpoints are mounted at `/api/*`
- admin-only routes are mounted under `/api/dashboard`
- auth checks are applied per-route, not globally, to avoid accidentally locking down all public content

This is intentional and reduces accidental breakage from blanket middleware assumptions.

---

## 6. Database model and persistence patterns

### Core models

#### `User`
Used for admin credential storage and authentication.

Important points:
- password hashing is handled in the auth controller or similar backend logic
- profile data is returned without exposing password hashes

#### `Products`
Defined in `backend/models/Products.js`.

Structure includes:
- `id` as a unique UUID-like identifier
- `userId` reference to the admin user
- `name`
- `price`
- `description`
- `status` (`normal` or `offer`)
- `category`
- `room`
- `features`
- `image`
- timestamps

This schema is the main data source for the public storefront.

#### `Blogs`, `Guides`, `Testimonials`, `Lead`, `Bot`
These models power the editorial, marketing, customer support, and sales workflows.

The system keeps them database-backed so content can be updated without frontend rebuilds.

### Data model summary

| Model | Purpose | Key fields | Used by |
| --- | --- | --- | --- |
| `User` | admin identity and auth | `name`, `email`, `password` | login, dashboard access |
| `Product` | public catalog inventory | `id`, `name`, `price`, `description`, `category`, `room`, `features`, `image`, `status` | storefront, category pages, product detail |
| `Blog` | editorial and SEO content | `title`, `content`, `image`, `author`, `slug`, `createdAt` | blog listing and article pages |
| `Guide` | inspiration and buying guidance | `title`, `summary`, `content`, `image`, `category` | guides section |
| `Lead` | customer enquiries and sales leads | `name`, `email`, `phone`, `message`, `source`, `status` | contact flows and dashboard sales follow-up |
| `Testimonial` | trust-building customer proof | `name`, `message`, `company`, `rating` | homepage and marketing sections |
| `Bot` | chatbot knowledge entries | `question`, `answer`, `tags`, `category` | chatbot responses |
| `otpStore` | password reset flow | `email`, `otp`, `expiresAt` | reset workflow |

This table is the mental model for how the app stores business data: the public site reads from catalog and content models, while the dashboard updates those same collections.

### Why only one account can be created per project

This project is intentionally designed around a single-admin ownership model rather than multi-user role management.

The rationale is practical:

- the repository is built as a small-business operational site, not a SaaS multi-tenant platform
- the dashboard is a business control panel, not a broad internal permissions system
- a single admin owner is easier to reason about for a local or small deployment
- the auth routes are built around a singular admin identity and a protected dashboard shell
- the current system does not implement roles, permissions, or team-based access control

In other words, the product assumes one business owner or one administrator managing the store. That is why there is no full RBAC (role-based access control) model in the current codebase.

This is also visible in the way profile data and dashboard access are checked: the system authenticates the current user and loads their own profile, but it does not manage multiple business users or staffing permissions.

---

## 7. How the business can manage everything from the dashboard

The dashboard is the operational center for the business and it is intentionally built as a single management workspace.

What the business can do from the dashboard:

- Add, edit, and remove products
- Manage pricing and product metadata
- Upload and replace product images
- Update category, room, status, and feature information
- Publish and update blog posts and SEO-oriented articles
- Create and manage inspiration guides
- Add or remove testimonials for trust-building and conversion
- Review customer leads and enquiries from the site
- Manage bot knowledge entries used by the chatbot
- View analytics across products, leads, blogs, guides, and bot interactions
- Switch between sections without leaving the dashboard shell

This is the key business reason the app exists: it converts the website from a static storefront into a live operational system where the owner can update business content in real time.

The dashboard is not only for cosmetics. It gives the business direct control over the live storefront data and marketing content driving the site.

### What the bot can manage from the dashboard

The dashboard has a Bot Knowledge module that lets the business maintain the intelligence behind the support chatbot.

This includes:

- adding knowledge Q&A pairs
- updating product-related answers
- revising customer support responses
- managing conversation topics and response content
- refreshing the knowledge base without changing frontend code

Because the bot draws from the database-backed knowledge source, the business can tune the customer experience without modifying source files directly.

This is an operationally important feature because it keeps the bot aligned with current products, policies, and customer concerns.

---

## 8. Key server startup sequence

The backend startup logic in `backend/server.js` is important and should be understood before changing server behavior.

### Sequence

```js
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', ... express.static(...));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/bot', chatbotRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
...
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(...));
});
```

### Why this order matters

- environment variables must be loaded first
- static and API routes are mounted before the SPA fallback
- API routes are checked before falling back to frontend routing
- MongoDB must be connected before the server accepts traffic

This avoids half-started server states and reduces confusing runtime failures in deployment.

---

## 8. Admin dashboard detail

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

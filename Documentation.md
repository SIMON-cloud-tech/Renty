Here's a comprehensive **4000+ word document** for your project:

---

# FURNIHAVEN - Complete Furniture E-Commerce Platform

## Technical Documentation & User Manual

### Version 1.0

---

## TABLE OF CONTENTS

1. Introduction
2. System Architecture
3. Data Flow Overview
4. Backend Structure
5. Frontend Structure
6. Database Models
7. API Endpoints
8. Key Features Explained
9. Installation Guide
10. User Manual
11. Common Bugs & Fixes
12. Business Value Proposition
13. Target Market
14. Pricing Rationale
15. Cashflow Improvement

---

## 1. INTRODUCTION

FurniHaven is a comprehensive furniture e-commerce platform built using the MERN stack (MongoDB, Express.js, React, Node.js). This platform is designed to help furniture businesses manage their online presence, track customer leads, automate customer service through an AI chatbot, and analyze business performance through a robust analytics dashboard.

The system consists of two main components: a public-facing website for customers and a protected admin dashboard for business owners. The public website allows customers to browse products, read guides and blogs, contact the business, and interact with a chatbot. The admin dashboard provides tools for managing products, blogs, guides, testimonials, leads, and bot knowledge, along with comprehensive analytics.

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- React Icons for UI icons
- Recharts for analytics charts
- CSS for styling

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Cloudinary for image storage
- JWT for authentication
- Bcrypt for password hashing

**Database:**
- MongoDB (NoSQL database)
- Collections: Users, Products, Blogs, Guides, Testimonials, Leads, Bot

### 2.2 Folder Structure

```
FurniHaven/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landingpage/
│   │   │   │   ├── jsx/
│   │   │   │   │   ├── Navbar.jsx
│   │   │   │   │   ├── Hero.jsx
│   │   │   │   │   ├── Categories.jsx
│   │   │   │   │   ├── Products.jsx
│   │   │   │   │   ├── CategoryPage.jsx
│   │   │   │   │   ├── ProductDetail.jsx
│   │   │   │   │   ├── NewArrivals.jsx
│   │   │   │   │   ├── Guides.jsx
│   │   │   │   │   ├── GuideDetail.jsx
│   │   │   │   │   ├── BlogSection.jsx
│   │   │   │   │   ├── BlogDetail.jsx
│   │   │   │   │   ├── Testimonials.jsx
│   │   │   │   │   ├── Contact.jsx
│   │   │   │   │   ├── Chatbot.jsx
│   │   │   │   │   └── Footer.jsx
│   │   │   │   └── css/
│   │   │   └── dashboard/
│   │   │       ├── jsx/
│   │   │       │   ├── Dashboard.jsx
│   │   │       │   ├── ProductManage.jsx
│   │   │       │   ├── BlogManage.jsx
│   │   │       │   ├── GuidesManage.jsx
│   │   │       │   ├── Bot.jsx
│   │   │       │   ├── Lead.jsx
│   │   │       │   ├── TestimonialsManage.jsx
│   │   │       │   └── analytics/
│   │   │       │       ├── AnalyticsOverview.jsx
│   │   │       │       ├── ProductAnalytics.jsx
│   │   │       │       ├── LeadAnalytics.jsx
│   │   │       │       ├── BlogAnalytics.jsx
│   │   │       │       ├── GuideAnalytics.jsx
│   │   │       │       └── BotAnalytics.jsx
│   │   │       └── css/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── utils/
│   │   │   ├── CartUtil.js
│   │   │   └── cacheUtil.js
│   │   └── App.jsx
│   └── public/
│       └── images/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── blogController.js
│   │   ├── guideController.js
│   │   ├── testimonialController.js
│   │   ├── leadController.js
│   │   ├── botController.js
│   │   └── analyticsControllers/
│   ├── models/
│   │   ├── User.js
│   │   ├── Products.js
│   │   ├── Blog.js
│   │   ├── Guide.js
│   │   ├── Testimonials.js
│   │   ├── Lead.js
│   │   └── Bot.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── inventoryRoute.js
│   │   ├── blogRoute.js
│   │   ├── guideRoute.js
│   │   ├── testimonialRoute.js
│   │   ├── leadRoute.js
│   │   ├── botRoute.js
│   │   └── analyticsRoutes/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   ├── uploadToCloudinary.js
│   │   └── chatBotParser.js
│   └── server.js
└── package.json
```

---

## 3. DATA FLOW OVERVIEW

### 3.1 Customer Journey Flow

```
Customer Visits Website
    ↓
Views Homepage (Hero, Categories, Products)
    ↓
Browses Products (Shop or Room categories)
    ↓
Views Product Details
    ↓
Adds to Cart
    ↓
Submits Contact Form or WhatsApp Inquiry
    ↓
Interacts with Chatbot
    ↓
Lead saved to Database
    ↓
Business Owner receives notification in Dashboard
```

### 3.2 Admin Flow

```
Admin Logs In
    ↓
Accesses Dashboard
    ↓
Manages Products (Add/Edit/Delete)
    ↓
Manages Blogs (Write/Edit/Delete)
    ↓
Manages Guides (Create/Edit/Delete)
    ↓
Reviews Leads (Contact/Convert/Close)
    ↓
Answers Bot Questions
    ↓
Views Analytics
    ↓
Makes Business Decisions
```

### 3.3 Data Persistence Flow

```
Frontend Component
    ↓
Fetch API Request
    ↓
Express Route
    ↓
Controller Function
    ↓
Mongoose Query
    ↓
MongoDB Database
    ↓
Response sent back
    ↓
Frontend state update
    ↓
UI re-render
```

---

## 4. BACKEND STRUCTURE

### 4.1 Server Setup (server.js)

The server initializes Express, sets up middleware (CORS, JSON parsing, cookie parsing), mounts routes, connects to MongoDB, and starts listening on port 5000.

Key middleware:
- **CORS**: Allows frontend at localhost:5173 to communicate with backend
- **Express JSON**: Parses incoming JSON requests
- **Cookie Parser**: Parses cookies for authentication

### 4.2 Database Models

#### User Model
```javascript
{
  id: String (unique),
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Product Model
```javascript
{
  id: String (unique),
  userId: ObjectId (ref: User),
  name: String,
  price: Number,
  description: String,
  status: String (normal/offer),
  category: String (sofas/beds/tables/outdoor/office),
  room: String (living-room/bedroom/kitchen/home-office/outdoor-spaces),
  features: [String],
  image: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

#### Lead Model
```javascript
{
  id: String (unique),
  name: String,
  phone: String,
  email: String,
  message: String,
  source: String (contact_form/whatsapp/phone),
  status: String (new/contacted/converted/closed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Bot Model
```javascript
{
  id: String (unique),
  keywords: [String],
  reply: String,
  question: String,
  category: String,
  isAnswered: Boolean,
  status: String (active/pending/answered/ignored),
  frequency: Number,
  context: Map,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 Authentication Flow

```
User registers/logs in
    ↓
Backend validates credentials
    ↓
JWT token created
    ↓
Token stored in HTTP-only cookie
    ↓
Frontend sends cookie with each request
    ↓
authMiddleware verifies token
    ↓
Protected routes accessible
```

---

## 5. FRONTEND STRUCTURE

### 5.1 Routing

The app uses React Router for navigation. Routes are defined in App.jsx.

**Public Routes:**
- `/` - Homepage
- `/about` - About page
- `/products` - All products
- `/products/:id` - Product detail
- `/shop/:category` - Shop categories (sofas, beds, etc.)
- `/rooms/:room` - Room categories (living-room, bedroom, etc.)
- `/blogs` - Blog listing
- `/blogs/:id` - Blog detail
- `/guides` - Guides listing
- `/guides/:id` - Guide detail
- `/newarrivals` - New arrivals
- `/contact` - Contact page

**Protected Routes:**
- `/admin` - Login page
- `/dashboard/*` - Admin dashboard

### 5.2 State Management

The app uses React's built-in state management:
- **useState** - For component-level state
- **useReducer** - For complex form state
- **useContext** - For cart state (via OutletContext)
- **useMemo** - For expensive computations
- **useCallback** - For memoized handlers

### 5.3 Cart Management

Cart state is managed in the PublicLayout using OutletContext. Cart operations are in CartUtil.js:

```javascript
addToCart(cart, product) - Adds product or increments quantity
incrementItem(cart, id) - Increments quantity
decrementItem(cart, id) - Decrements quantity
removeFromCart(cart, id) - Removes item
getCartTotal(cart) - Calculates total
getCartCount(cart) - Counts items
```

---

## 6. API ENDPOINTS

### 6.1 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login user |
| POST | `/api/reset` | Request password reset |
| GET | `/api/inventory` | Get all products |
| GET | `/api/inventory/:id` | Get single product |
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs/:id` | Get single blog |
| GET | `/api/guides` | Get all guides |
| GET | `/api/guides/:id` | Get single guide |
| GET | `/api/testimonials` | Get all testimonials |
| POST | `/api/leads` | Create lead (contact form) |
| POST | `/api/chatbot/chat` | Chat with bot |

### 6.2 Protected Endpoints (Require Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inventory` | Add product |
| PUT | `/api/inventory/:id` | Update product |
| DELETE | `/api/inventory/:id` | Delete product |
| POST | `/api/blogs` | Add blog |
| PUT | `/api/blogs/:id` | Update blog |
| DELETE | `/api/blogs/:id` | Delete blog |
| POST | `/api/guides` | Add guide |
| PUT | `/api/guides/:id` | Update guide |
| DELETE | `/api/guides/:id` | Delete guide |
| GET | `/api/leads` | Get all leads |
| PUT | `/api/leads/:id` | Update lead status |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/bot` | Get bot knowledge |
| POST | `/api/bot` | Add bot knowledge |
| PUT | `/api/bot/:id` | Update bot knowledge |
| DELETE | `/api/bot/:id` | Delete bot knowledge |

### 6.3 Analytics Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Overall stats |
| GET | `/api/analytics/products` | Product analytics |
| GET | `/api/analytics/leads` | Lead analytics |
| GET | `/api/analytics/blogs` | Blog analytics |
| GET | `/api/analytics/guides` | Guide analytics |
| GET | `/api/analytics/bot` | Bot analytics |

---

## 7. KEY FEATURES EXPLAINED

### 7.1 AI Chatbot

The chatbot uses a knowledge base stored in MongoDB. When a user asks a question:

1. Message sent to backend
2. Parser extracts keywords
3. Keywords matched against bot knowledge
4. Best match returned as reply
5. Unanswered questions saved for admin review

### 7.2 Lead Management

When a customer fills the contact form:

1. Form data saved to MongoDB as a lead
2. WhatsApp opens with pre-filled message
3. Lead appears in admin dashboard
4. Admin can mark as contacted, converted, or closed
5. Admin can reply via WhatsApp directly from dashboard

### 7.3 Analytics Dashboard

Analytics read from all models and provide:
- Total products, leads, blogs, guides
- Conversion rates
- Monthly trends
- Category distribution
- Bot performance

### 7.4 localStorage Caching

Products, categories, and other data are cached in localStorage:
- First visit: Fetch from API, save to cache
- Repeat visits: Read from cache instantly
- Cache expires after 30 minutes
- Cart persists across sessions

---

## 8. INSTALLATION GUIDE

### 8.1 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### 8.2 Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd FurniHaven/backend

# Install dependencies
npm install

# Create .env file
touch .env

# Add to .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/furnihaven
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=5000

# Start backend
npm run dev
```

### 8.3 Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
touch .env

# Add to .env:
VITE_WHATSAPP_NUMBER=254727713219
VITE_MAP_EMBED_URL=your-google-maps-embed-url

# Start frontend
npm run dev
```

### 8.4 Seed Data

```bash
# Seed products
cd backend
node seedProducts.js

# Seed bot knowledge
node seedBot.js
```

---

## 9. USER MANUAL

### 9.1 Customer Usage

**Browsing Products:**
1. Visit the website
2. Browse categories on homepage
3. Use Shop dropdown for item-based browsing
4. Use Rooms dropdown for room-based browsing
5. Click products to view details
6. Add to cart or enquire via WhatsApp

**Contacting Business:**
1. Fill contact form with name, phone, message
2. Click "Send on WhatsApp"
3. WhatsApp opens with pre-filled message
4. Lead automatically saved to business dashboard

**Using Chatbot:**
1. Click chat icon (bottom right)
2. Ask questions about products, pricing, delivery
3. Bot responds based on knowledge base
4. Unanswered questions saved for business review

### 9.2 Admin Usage

**Managing Products:**
1. Login at /admin
2. Go to Product Management
3. Click "Add Product"
4. Fill form (name, price, description, category, room, image)
5. Click Save

**Managing Leads:**
1. Go to Customer Leads
2. View all inquiries
3. Click "Reply" to open WhatsApp with customer
4. Update status (New → Contacted → Converted)

**Managing Bot:**
1. Go to Bot Knowledge
2. View unanswered questions
3. Click "Answer" to respond
4. Bot automatically learns new answers

**Viewing Analytics:**
1. Go to Analytics section
2. View Overview for summary
3. Check Products, Leads, Blogs analytics
4. Make informed business decisions

---

## 10. COMMON BUGS & FIXES

### 10.1 CORS Error

**Symptom:** "Cross-Origin Request Blocked" in console

**Fix:** Ensure CORS is configured in server.js:
```javascript
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
```

### 10.2 401 Unauthorized

**Symptom:** Dashboard shows "Unauthorized"

**Fix:** Ensure cookies are being sent with requests:
```javascript
fetch('/api/profile', { credentials: 'include' });
```

### 10.3 Images Not Loading

**Symptom:** Broken image icons

**Fix:** Check image paths. For public folder images, use leading slash:
```json
"image": "/living.jpeg"
```

### 10.4 Module Not Found

**Symptom:** Backend crashes with "Cannot find module"

**Fix:** Install missing dependencies:
```bash
npm install <package-name>
```

### 10.5 MongoDB Connection Error

**Symptom:** "MongoDB connection error"

**Fix:** Check MONGODB_URI in .env file. Ensure database user has correct permissions.

### 10.6 Form Not Submitting

**Symptom:** Clicking save does nothing

**Fix:** Check browser console for errors. Ensure all required fields are filled.

---

## 11. BUSINESS VALUE PROPOSITION

### 11.1 Problems It Solves

1. **No Online Presence** - Many furniture stores rely on physical stores or social media only
2. **Lost Customer Inquiries** - WhatsApp messages get lost, no tracking
3. **No Customer Data** - Can't track who's interested in what
4. **Poor Customer Service** - No automated responses outside business hours
5. **No Business Insights** - Don't know what's selling or what customers want
6. **Manual Follow-up** - No system for tracking leads
7. **Limited Reach** - Can't sell beyond physical location

### 11.2 How It Solves These

1. **Online Store** - 24/7 product browsing
2. **Lead Management** - Every inquiry tracked
3. **Customer Database** - Know who's interested
4. **AI Chatbot** - Instant responses anytime
5. **Analytics** - Data-driven decisions
6. **Automated Follow-up** - Lead status tracking
7. **Nationwide Delivery** - Expand beyond local area

---

## 12. TARGET MARKET

### 12.1 Ideal Businesses

1. **Furniture Stores** - Primary target
2. **Interior Designers** - Showcase work, get leads
3. **Home Decor Shops** - Similar product range
4. **Office Furniture Suppliers** - B2B focus
5. **Carpenters/Workshops** - Sell custom pieces
6. **Mattress Stores** - Bedroom specialists
7. **Outdoor Furniture Shops** - Patio/garden focus

### 12.2 Geographic Markets

**Kenya:**
- Nairobi (Karen, Kilimani, Westlands, etc.)
- Mombasa
- Kisumu
- Nakuru

**International:**
- USA (furniture stores without e-commerce)
- UK (similar market)
- UAE (high furniture demand)
- South Africa (regional)

---

## 13. PRICING RATIONALE

### 13.1 Development Cost

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| Frontend | 100 | $20/hr | $2,000 |
| Backend | 80 | $20/hr | $1,600 |
| Database | 20 | $20/hr | $400 |
| Testing | 30 | $20/hr | $600 |
| Documentation | 20 | $20/hr | $400 |
| **Total** | **250** | | **$5,000** |

### 13.2 Market Pricing

| Platform | Similar Product | Price |
|----------|-----------------|-------|
| Custom Development | $10,000 - $50,000 | |
| Shopify Template | $180 - $350 | |
| Our Solution | $2,500 - $7,500 | |

### 13.3 Why Our Price Is Fair

1. **Complete Solution** - Not just a template
2. **Includes AI Chatbot** - Custom feature
3. **Lead Management** - CRM functionality
4. **Analytics** - Business intelligence
5. **Mobile Responsive** - Works everywhere
6. **SEO Optimized** - Ranks on Google
7. **Support Included** - We help you set up

---

## 14. CASHFLOW IMPROVEMENT

### 14.1 Direct Revenue Increase

**More Sales:**
- Online store opens 24/7
- Reach customers beyond physical location
- WhatsApp integration for quick inquiries

**Better Conversion:**
- Lead tracking ensures no inquiry is lost
- Follow-up system increases conversion
- Chatbot answers questions instantly

### 14.2 Cost Reduction

**Reduced Manual Work:**
- Automated lead capture
- Chatbot handles common questions
- Analytics replaces manual tracking

**Lower Marketing Costs:**
- SEO brings organic traffic
- Blog content attracts customers
- Social proof (testimonials) builds trust

### 14.3 ROI Calculation

**Example:**
- Website cost: KSh 200,000 (one-time)
- Monthly maintenance: KSh 10,000
- Additional sales per month: 10 customers
- Average sale: KSh 50,000
- Additional revenue: KSh 500,000/month
- **ROI: 2.5x in first month**

---

## 15. CONCLUSION

FurniHaven is more than a website - it's a complete business management platform. It solves real problems that furniture stores face daily: lost leads, poor customer service, no data insights, and limited reach.

With features like AI chatbot, lead management, analytics dashboard, and WhatsApp integration, this platform gives businesses the tools they need to grow and compete in the digital age.

The investment of KSh 200,000 (or $2,500 internationally) is minimal compared to the potential return. Most businesses recover this investment within the first month through increased sales and improved customer management.

This platform is ideal for any furniture business looking to establish or improve their online presence, streamline operations, and grow their customer base.

---

**END OF DOCUMENTATION**

*For support, contact: info@furnihaven.co.ke*

*Version 1.0 - 2026*
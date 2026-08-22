# Furnihaven

Furnihaven is a full-stack furniture and homeware storefront with a public shopping experience and a secure admin dashboard. The project combines a modern React frontend with a Node.js/Express backend, allowing the business to manage products, blog content, inventory, and customer-facing pages without needing to touch code.

## Overview

This application includes:

- A public storefront with a landing page, featured products, product listings, blog articles, testimonials, and contact sections
- A shopping cart and WhatsApp-based checkout flow
- A secure admin dashboard for managing inventory and website content
- JWT-based authentication with protected routes and reset-password support
- MongoDB-backed data models with API endpoints for the frontend
- Cloudinary-compatible image uploads for product and content management

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- React Icons
- React Helmet Async

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs
- Multer
- Cookie Parser
- Nodemailer / Resend

## Project Structure

```bash
Furnihaven/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── chatBotController.js
│   │   ├── inventoryController.js
│   │   ├── resetController.js
│   │   └── testimonialController.js
│   ├── data/
│   │   └── chatbotknowledge.json
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Blogs.js
│   │   ├── otpStore.js
│   │   ├── Products.js
│   │   ├── Testimonials.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── blogRoute.js
│   │   ├── chatBotRoute.js
│   │   ├── dashboardRoute.js
│   │   ├── inventoryRoute.js
│   │   ├── projectRoute.js
│   │   ├── resetRoute.js
│   │   └── testimonialRoute.js
│   ├── utils/
│   │   ├── chatBotParser.js
│   │   ├── cloudinary.js
│   │   ├── errorHandler.js
│   │   ├── sendEmail.js
│   │   └── uploadToCloudinary.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── css/
│   │   │   │   │   ├── Auth.css
│   │   │   │   │   ├── BlogManage.css
│   │   │   │   │   ├── Dashboard.css
│   │   │   │   │   ├── Inventory.css
│   │   │   │   │   ├── ProductManage.css
│   │   │   │   │   ├── ProjectManage.css
│   │   │   │   │   ├── Reset.css
│   │   │   │   │   └── TestimonialsManage.css
│   │   │   │   └── jsx/
│   │   │   │       ├── Auth.jsx
│   │   │   │       ├── BlogManage.jsx
│   │   │   │       ├── Dashboard.jsx
│   │   │   │       ├── Inventory.jsx
│   │   │   │       ├── ProductManage.jsx
│   │   │   │       ├── Reset.jsx
│   │   │   │       └── TestimonialManage.jsx
│   │   │   └── landingpage/
│   │   │       ├── css/
│   │   │       │   ├── BlogDetail.css
│   │   │       │   ├── BlogSection.css
│   │   │       │   ├── Cart.css
│   │   │       │   ├── Chatbot.css
│   │   │       │   ├── Contact.css
│   │   │       │   ├── FeaturedProducts.css
│   │   │       │   ├── Footer.css
│   │   │       │   ├── Hero.css
│   │   │       │   ├── Loader.css
│   │   │       │   ├── Navbar.css
│   │   │       │   ├── Process.css
│   │   │       │   ├── ProductDetail.css
│   │   │       │   ├── Products.css
│   │   │       │   ├── Story.css
│   │   │       │   └── Testimonials.css
│   │   │       └── jsx/
│   │   │           ├── BlogDetail.jsx
│   │   │           ├── BlogSection.jsx
│   │   │           ├── Cart.jsx
│   │   │           ├── Chatbot.jsx
│   │   │           ├── FeaturedProducts.jsx
│   │   │           ├── Footer.jsx
│   │   │           ├── Hero.jsx
│   │   │           ├── Loader.jsx
│   │   │           ├── Navbar.jsx
│   │   │           ├── Process.jsx
│   │   │           ├── ProductDetail.jsx
│   │   │           ├── Products.jsx
│   │   │           ├── Reach.jsx
│   │   │           ├── Story.jsx
│   │   │           └── Testimonials.jsx
│   │   ├── layouts/
│   │   │   └── PublicLayout.jsx
│   │   ├── pages/
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Home.jsx
│   │   │   └── ProductsPage.jsx
│   │   ├── utils/
│   │   │   └── CartUtil.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── Dockerfile
├── cookies.txt
├── package.json
├── seed-data.sh
├── README.md
└── .gitignore
```

## Key Frontend Pages and Components

### Public-facing UI
- `Home.jsx` renders the landing page entry experience
- `About.jsx` contains the brand and company story sections
- `Contact.jsx` provides contact and enquiry actions
- `ProductsPage.jsx` is used for the product catalog experience
- `Navbar.jsx`, `Footer.jsx`, `Hero.jsx`, `FeaturedProducts.jsx`, `Story.jsx`, `Process.jsx`, and `Testimonials.jsx` make up the storefront layout
- `Products.jsx` and `ProductDetail.jsx` handle the product catalogue and detail view
- `BlogSection.jsx` and `BlogDetail.jsx` power the blog area
- `Cart.jsx` handles cart functionality and checkout actions
- `Chatbot.jsx` adds the customer support assistant

### Admin UI
- `Auth.jsx` controls admin sign-in
- `Reset.jsx` handles password reset flow
- `Dashboard.jsx` is the main admin shell
- `Inventory.jsx` and `ProductManage.jsx` manage store inventory
- `BlogManage.jsx` manages content publishing
- `TestimonialManage.jsx` handles client testimonials

## App Routes

The frontend routing is defined in `App.jsx` and includes:

- `/` → Home page
- `/about` → About page
- `/products` → Products listing
- `/contact` → Contact page
- `/blogs` → Blog listing
- `/blogs/:id` → Blog detail page
- `/admin` → Admin login
- `/reset` → Password reset
- `/dashboard/*` → Protected admin dashboard

## Setup and Run

### 1. Install dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Start the project

From the project root:

```bash
npm run dev
```

This uses the root script to run the frontend and backend together via `concurrently`.

### 3. Run frontend and backend separately

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder with values such as:


## Notes

- The project uses a hybrid content architecture with both MongoDB models and routed API logic.
- Product, blog, testimonial, and dashboard management are connected to the backend APIs.
- The public storefront and the admin interface live inside the same repository but are split between `frontend/` and `backend/`.
- The project name and folder structure in this repository are now aligned with the actual Furnihaven implementation.

## License

This project is currently configured for local development and deployment work. Update the license details if you plan to publish or distribute it publicly.

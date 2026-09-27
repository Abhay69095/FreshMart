# FreshMart - Online Fresh Produce & Local Vendor E-Commerce Platform

A production-grade, full-stack web application engineered to bridge traditional offline fruit & vegetable vendors with modern neighborhood customers. FreshMart empowers local farm vendors to take their physical mandi stalls online, offering real-time stock control, dynamic pricing, express 90-minute neighborhood dispatch, multi-step checkout, and live order tracking.

---

## 1. Project Purpose & Problem Statement

### The Problem
Traditional Indian fruit and vegetable vendors start their workdays at 4:00 AM at local wholesale market yards (mandi). Despite procuring the freshest produce directly from cultivators, they lose market share to corporate grocery aggregators. Meanwhile, consumers receive produce that has spent 4–6 days in cold storage warehouses, stripped of crispness, aroma, and natural vitamins.

### The Solution
FreshMart enables local APMC market vendors to establish a dedicated, zero-middleman online storefront. Customers enjoy:
- **Morning-Harvest Freshness**: Directly from wholesale crates to customer doorsteps in under 90 minutes.
- **Fair Transparent Mandi Pricing**: Tomatoes at ₹40/kg, onions at ₹38/kg with zero hidden inflation.
- **Inspect & Pay (COD / UPI)**: Inspect produce at the door before payment.
- **Empowered Local Vendor**: Direct admin control over catalog, stock alerts, discounts, and dispatch status.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 (TypeScript, Hooks, Functional Components)
- **Tooling**: Vite 8 & TSX
- **Styling**: Tailwind CSS v4 (Typography scale, warm earthy neutrals & emerald accents)
- **Routing**: React Router DOM (v7) with nested layout routes
- **Icons**: Lucide React
- **State Management**:
  - `AuthContext`: JWT bearer authentication, session persistence, wishlist sync
  - `CartContext`: Quantity stepper, inventory stock bounds, dynamic free-delivery meter
  - `ToastContext`: Accessible non-intrusive status toast alerts

### Backend
- **Runtime**: Node.js & Express.js (REST API Architecture)
- **Language**: TypeScript (`server.ts` entry point)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` salted password hashing
- **Security & Middleware**: Role-Based Access Control (RBAC), CORS, centralized error handling
- **Database Engine**:
  - Full MongoDB/Mongoose Model layer architecture
  - High-performance embedded JSON document persistence (`backend/data/freshmart_db.json`) for zero-configuration viva evaluations and local portability
  - Seamless external connection if `MONGODB_URI` environment variable is configured

---

## 3. Demo Credentials (For Viva & Presentation)

FreshMart comes pre-seeded with realistic data (24+ products, 8 categories, 5 customer profiles, 10 order workflows):

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Vendor / Admin** | `admin@freshmart.com` | `admin123` | Full Dashboard, Product CRUD, Stock Alerts, Orders Dispatch, Categories, Customers |
| **Customer (Demo)** | `rahul@freshmart.com` | `customer123` | Cart, Wishlist, Multi-step Checkout, Order Tracking, Profile Management |

*Tip: The Login page includes 1-Click Demo Buttons for instant viva demonstration without typing.*

---

## 4. Key Functional Modules

### A. Customer Storefront
1. **Landing / Home**: Hero banner with morning harvest guarantee, "Fresh from Local Vendors" spotlight, popular categories, best deals, seasonal harvest, customer reviews, and value propositions.
2. **Products Catalog**: Real search (by produce name, category, and description), multi-faceted filter sidebar (categories, price min/max, in-stock only, discounted deals, organic, seasonal), and multiple sorting options (Price Low-to-High, High-to-Low, Newest, Most Popular).
3. **Product Details (PDP)**: Contiguous purchase module, large gallery images, certified electronic weight units (250g, 500g, 1kg, 2kg, per piece), stock indicators, vendor verification badge, and verified reviews.
4. **Basket & Cart**: Quantity controls bounded by live warehouse stock, free delivery threshold meter (free above ₹499), 5% promotional discount calculation, and localStorage persistence.
5. **4-Step Checkout**:
   - Step 1: Customer Contact Info (Name, Mobile, Email)
   - Step 2: Delivery Address (House/Building, Street, Area, City, State, PIN code, Landmark)
   - Step 3: Payment Method (Cash on Delivery, UPI with QR / VPA, Simulated Online Payment)
   - Step 4: Final Order Confirmation with itemized review
6. **Order Confirmation & Live Tracking**: Five-stage timeline (`Placed` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`), delivery destination preview, and 1-click order cancellation if eligible.
7. **Wishlist**: Quick toggle and 1-click "Move to Cart".
8. **Customer Profile**: Personal details and delivery address management.

### B. Vendor / Admin Portal
1. **Analytics Dashboard**: Real-time KPI metric cards (Total Sales ₹, Total Orders, Active Customers, Low Stock Alerts, Pending Orders), 7-day revenue bar chart, revenue by category breakdown, and top-selling produce.
2. **Product Management**: Complete CRUD operations, real-time stock adjuster, standard vs. discounted price control, freshness notes, and availability toggle.
3. **Dispatch & Order Fulfillment**: Real-time status updater (Placed → Confirmed → Preparing → Out for Delivery → Delivered → Cancelled) with timestamped status history notes that instantly reflect on customer screens.
4. **Stock & Inventory Warning Center**: Highlighted warning filters for Low Stock (≤ 10 items) and Out of Stock (0 items) with instant +10, +25, +50 kg restock buttons.
5. **Category Management**: Create, edit, and delete produce categories.
6. **Customer Directory**: View all registered customers, order frequency, total spending, and addresses.
7. **Store Profile**: Manage physical APMC stall location, vendor name, opening hours, delivery radius, and delivery fees.

---

## 5. REST API Architecture

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer or admin with JWT
- `GET  /api/auth/profile` - Fetch authenticated user profile (Protected)
- `PUT  /api/auth/profile` - Update customer profile & shipping address (Protected)
- `POST /api/auth/wishlist/toggle` - Add/remove product from user wishlist (Protected)
- `POST /api/auth/forgot-password` - Account recovery helper

### Products & Categories (`/api/products`, `/api/categories`)
- `GET  /api/products` - Search, filter, and sort products
- `GET  /api/products/featured` - Home page carousel and collections
- `GET  /api/products/:id` - Full product details, reviews, and related items
- `GET  /api/categories` - All produce categories with active item counts
- `GET  /api/categories/:slug` - Category details and associated produce

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` - Place order with automatic inventory deduction and FM2026... ID generation
- `GET  /api/orders/my-orders` - Fetch all orders for logged-in user
- `GET  /api/orders/:id` - Fetch single order with live timeline history
- `PUT  /api/orders/:id/cancel` - Cancel order and automatically restore inventory stock

### Vendor Admin Operations (`/api/admin`)
- `GET    /api/admin/dashboard` - Sales analytics, revenue trends, top items
- `GET    /api/admin/products` - Admin product catalog with inventory filters
- `POST   /api/admin/products` - Create new fruit or vegetable
- `PUT    /api/admin/products/:id` - Edit product details, pricing, and stock
- `DELETE /api/admin/products/:id` - Delete product from catalog
- `POST   /api/admin/products/:id/restock` - Quick stock increment
- `GET    /api/admin/orders` - View all customer orders with status filters
- `PUT    /api/admin/orders/:id/status` - Transition order status and append dispatch note
- `GET    /api/admin/customers` - Customer spending and history directory
- `POST   /api/admin/categories` - Create new produce category
- `PUT    /api/admin/categories/:id` - Edit category
- `DELETE /api/admin/categories/:id` - Delete category

---

## 6. Project Directory Structure

```
freshmart/
├── backend/
│   ├── config/
│   │   └── db.ts                # Database connection & seed runner
│   ├── controllers/
│   │   ├── adminController.ts   # Vendor dashboard, stock, & order dispatch
│   │   ├── authController.ts    # JWT registration, login, profile, & wishlist
│   │   ├── categoryController.ts# Category management
│   │   ├── orderController.ts   # Order placement, deduction, & cancellation
│   │   ├── productController.ts # Search, filter, sort, & product details
│   │   └── storeController.ts   # Physical stall profile settings
│   ├── data/
│   │   ├── dbStore.ts           # Embedded document database engine
│   │   └── seedData.ts          # Realistic seed items (24+ produce, 8 categories)
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification & RBAC admin guard
│   │   └── errorHandler.ts      # Global centralized error handler
│   ├── models/
│   │   ├── Category.ts          # Category schema & model methods
│   │   ├── Order.ts             # Order schema & status history types
│   │   ├── Product.ts           # Product schema with units & stock
│   │   ├── Store.ts             # Store profile schema
│   │   └── User.ts              # User schema with hashed passwords
│   └── routes/
│       ├── adminRoutes.ts
│       ├── authRoutes.ts
│       ├── categoryRoutes.ts
│       ├── orderRoutes.ts
│       ├── productRoutes.ts
│       └── storeRoutes.ts
├── src/
│   ├── assets/images/           # High-resolution generated produce assets
│   ├── components/
│   │   ├── AdminSidebar.tsx     # Admin navigation drawer
│   │   ├── Footer.tsx           # Store information, timings, & guarantees
│   │   ├── Navbar.tsx           # Responsive header, search bar, & cart badge
│   │   ├── OrderTimeline.tsx    # Live 5-stage visual delivery tracker
│   │   └── ProductCard.tsx      # Standardized card with stock controls
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state & wishlist sync
│   │   ├── CartContext.tsx      # Cart state, stock bounds, & fee calculation
│   │   └── ToastContext.tsx     # Toast alerts
│   ├── layouts/
│   │   ├── AdminLayout.tsx      # Protected admin shell
│   │   └── CustomerLayout.tsx   # Public customer storefront shell
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminCategories.tsx
│   │   │   ├── AdminCustomers.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminInventory.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   └── AdminStoreProfile.tsx
│   │   ├── About.tsx
│   │   ├── Cart.tsx
│   │   ├── Categories.tsx
│   │   ├── Checkout.tsx
│   │   ├── Contact.tsx
│   │   ├── FAQ.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── MyOrders.tsx
│   │   ├── NotFound.tsx
│   │   ├── OrderDetails.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── ProductDetails.tsx
│   │   ├── Products.tsx
│   │   ├── Register.tsx
│   │   ├── UserProfile.tsx
│   │   └── Wishlist.tsx
│   ├── services/
│   │   └── api.ts               # Type-safe API client
│   ├── types/
│   │   └── index.ts             # TypeScript domain interfaces
│   ├── App.tsx                  # Master routing configuration
│   ├── index.css                # Tailwind styling & typography rules
│   └── main.tsx
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── server.ts                    # Full-Stack Express + Vite dev server entry point
├── tsconfig.json
└── vite.config.ts
```

---

## 7. How to Run & Environment Setup

### Prerequisites
- Node.js (version 18+)
- npm or yarn

### Installation & Execution
1. Clone or navigate to the repository directory:
   ```bash
   cd freshmart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm run dev
   ```
   The full-stack application will automatically initialize the embedded JSON document database with all demo products, categories, customers, and orders, starting at `http://localhost:3000`.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 8. Future Roadmap & Improvements
- **Live WhatsApp Dispatch Notifications**: Automatically push delivery timeline updates to customer WhatsApp numbers upon status transitions.
- **Direct Farmer Co-op Portal**: Dedicated vendor sub-accounts for multiple farmer groups in neighboring rural talukas.
- **Weighing Machine IoT Integration**: Direct serial/Bluetooth sync between vendor weighing scales and cart item adjustments.
- **Subscription Harvest Boxes**: Weekly automated recurring fruit and vegetable baskets.

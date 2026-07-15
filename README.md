# Local Marketplace Platform — Phase 1 (MERN Stack)

A local marketplace platform where **customers** can browse nearby stores & products, **vendors** can manage their stores/products/orders, and **admins** can approve vendors and monitor platform activity.

Built for the Samaaroh Technologies Round 2 Internship Assignment (Web Developer - MERN Stack).

---

## 🧾 Project Overview

This is Phase 1 of a Local Marketplace Platform supporting 3 roles:
- **Customer** — browse stores/products, search & filter, cart, COD checkout, order history, profile
- **Vendor** — create/manage store, product CRUD, view & manage incoming orders
- **Admin** — dashboard stats, approve/reject vendors, enable/disable stores, delete inappropriate products, view all orders

---

## ✨ Features

### Authentication
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Customer / Vendor / Admin) via protected routes
- Vendor accounts require admin approval before login is allowed

### Customer
- View nearby stores, browse & search products, filter by category
- Product detail view
- Cart: add / remove / update quantity / clear cart
- Checkout with Cash on Delivery (COD) only, delivery address, order total
- Order history
- View/edit profile

### Vendor
- Create / edit / view store (name, description, address, category, contact number)
- Product management: add / edit / delete / list products (name, description, category, price, stock, image, return eligibility)
- Orders: view incoming orders, accept / reject, update order status (shipped, delivered, etc.)

### Admin
- Dashboard: total customers, vendors, stores, products, orders
- Vendor approval: view applications, approve / reject
- Store management: view all stores, enable / disable
- Product management: view all products, delete inappropriate ones
- Order management: view all orders & order details

### UI
- Responsive design (Tailwind CSS)
- Sidebar + Navbar layout for Vendor/Admin panels
- Dashboard cards, professional tables, search & filters
- Toast notifications (react-hot-toast), loading indicators, empty states, 404 page

### Validation
- Required fields, email format, password strength (min 6 chars)
- Product price & stock quantity cannot be negative

---

## 🛠️ Tech Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Frontend       | React.js, React Router, Axios, Tailwind CSS   |
| Backend        | Node.js, Express.js                           |
| Database       | MongoDB (Mongoose)                            |
| Authentication | JWT, bcrypt                                   |
| Version Control| Git & GitHub                                  |

---

## 📁 Folder Structure

```
local-marketplace/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level pages
│       ├── context/         # AuthContext
│       ├── hooks/           # useAuth
│       ├── services/        # Axios instance
│       ├── App.jsx
│       └── main.jsx
├── server/                   # Node/Express backend
│   ├── config/               # DB connection
│   ├── models/               # Mongoose schemas
│   ├── controllers/          # Route logic
│   ├── routes/                # Express routers
│   ├── middleware/            # auth, error handler
│   ├── seed.js                # creates default admin
│   └── server.js              # entry point
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup
```bash
cd server
npm install
cp .env.sample .env   # then fill in MONGO_URI, JWT_SECRET etc.
node seed.js           # creates a default admin account
npm run dev             # starts server on http://localhost:5000
```

Default admin credentials (created by seed.js):
```
email: admin@marketplace.com
password: Admin@123
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev              # starts React app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so both servers need to run together during development.

### 3. Build for production
```bash
cd client
npm run build            # outputs static build in client/dist
```

---

## 🔑 Environment Variables (server/.env)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/local_marketplace
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📡 API List

### Auth — `/api/auth`
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /register | Public |
| POST | /login | Public |
| POST | /logout | Protected |
| GET  | /profile | Protected |
| PUT  | /profile | Protected |

### Customer — `/api/customer`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /stores | Public |
| GET | /stores/:id | Public |
| GET | /products | Public |
| GET | /products/:id | Public |
| GET | /cart | Customer |
| POST | /cart | Customer |
| PUT | /cart/:productId | Customer |
| DELETE | /cart/:productId | Customer |
| DELETE | /cart | Customer |
| POST | /orders | Customer |
| GET | /orders | Customer |

### Vendor — `/api/vendor`
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /store | Vendor |
| GET | /store | Vendor |
| PUT | /store | Vendor |
| POST | /products | Vendor |
| GET | /products | Vendor |
| PUT | /products/:id | Vendor |
| DELETE | /products/:id | Vendor |
| GET | /orders | Vendor |
| PUT | /orders/:id | Vendor |

### Admin — `/api/admin`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /dashboard | Admin |
| GET | /vendors | Admin |
| PUT | /vendors/:id/approve | Admin |
| PUT | /vendors/:id/reject | Admin |
| GET | /stores | Admin |
| PUT | /stores/:id/toggle | Admin |
| GET | /products | Admin |
| DELETE | /products/:id | Admin |
| GET | /orders | Admin |
| GET | /orders/:id | Admin |

### Categories — `/api/categories`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | / | Public |
| POST | / | Admin |

---

## 🔮 Future Scope
- Image upload via Cloudinary instead of raw image URLs
- Pagination for product/store/order lists
- Product sorting (price, popularity)
- Wishlist module
- Dark mode toggle
- Admin dashboard charts (sales trends, top products)
- Online payment gateway integration (beyond COD)
- Real-time order status updates via WebSockets
- Ratings & reviews module

---

## 📝 Notes
- This is a Phase 1 implementation focused on core functionality across all 3 roles as per the assignment brief.
- COD is the only supported payment method in this phase.
- Every candidate must be able to explain the implementation during the technical interview, per assignment instructions.

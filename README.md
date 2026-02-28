# SB Foods - On-Demand Food Ordering Application

<div align="center">
  <h3>🍕 A Modern, Full-Stack Food Ordering Platform</h3>
  <p>Built with React.js, Supabase, and modern web technologies</p>
</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

---

## 🎯 About

SB Foods is a comprehensive food ordering web application that connects customers with restaurants. The platform features role-based access control with separate interfaces for customers, restaurant owners, and administrators. Built with modern technologies, it provides a seamless experience for ordering food online.

---

## ✨ Features

### 👤 Customer Features
- **User Authentication**: Secure registration and login system
- **Browse Restaurants**: View all approved restaurants with search functionality
- **Restaurant Details**: View restaurant menus with category filtering
- **Shopping Cart**: Add items to cart with quantity management
- **Order Placement**: Complete checkout with delivery information
- **Order History**: Track all past orders with detailed information
- **Profile Management**: Update personal information

### 🍽️ Restaurant Owner Features
- **Restaurant Management**: Create and manage restaurant profile
- **Menu Management**: Add, edit, and delete menu items
- **Availability Control**: Toggle product availability
- **Order Management**: View and update order status
- **Order Tracking**: Monitor incoming orders in real-time

### 👨‍💼 Admin Features
- **Dashboard**: Overview of platform statistics
- **Restaurant Approval**: Approve or reject restaurant applications
- **User Management**: View all users and their roles
- **Order Monitoring**: View all orders across the platform
- **Analytics**: Track total revenue and platform metrics

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Modern styling with CSS variables

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Tools & Libraries
- **@supabase/supabase-js** - Supabase client library
- **ESLint** - Code linting

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Supabase Account** - [Sign up](https://supabase.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Wait for the project to be set up

### 2. Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (API URL)
   - **anon/public key** (API Key)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

### 4. Database Setup

The database schema has been created with migrations. The following tables are included:

- `profiles` - User profiles
- `restaurants` - Restaurant information
- `products` - Menu items
- `cart_items` - Shopping cart
- `orders` - Order information
- `order_items` - Order line items

All tables have Row Level Security (RLS) enabled with appropriate policies.

---

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
project/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── lib/              # Utilities and configurations
│   │   └── supabase.js
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Restaurants.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Users.jsx
│   │   ├── restaurant/   # Restaurant owner pages
│   │   │   ├── Dashboard.jsx
│   │   │   └── Orders.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── RestaurantDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderHistory.jsx
│   │   └── Profile.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── App.css           # App styles
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Dependencies
└── README.md            # This file
```

---

## 👥 User Roles

### Customer (Default Role)
- Browse and order from approved restaurants
- Manage cart and place orders
- View order history
- Update profile

### Restaurant Owner
- Requires registration with role selection
- Pending approval from admin after registration
- Once approved:
  - Manage restaurant profile
  - Add/edit/delete menu items
  - View and manage incoming orders
  - Update order status

### Admin
- Full platform access
- Manage all users
- Approve/reject restaurants
- Monitor all orders
- View platform statistics

---

## 🗄️ Database Schema

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `role` (text: 'user', 'restaurant', 'admin')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### restaurants
- `id` (uuid, primary key)
- `owner_id` (uuid, references profiles)
- `name` (text)
- `description` (text)
- `address` (text)
- `contact` (text)
- `image_url` (text)
- `approved` (boolean)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### products
- `id` (uuid, primary key)
- `restaurant_id` (uuid, references restaurants)
- `name` (text)
- `description` (text)
- `price` (decimal)
- `category` (text)
- `image_url` (text)
- `available` (boolean)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### cart_items
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `product_id` (uuid, references products)
- `quantity` (integer)
- `size` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `restaurant_id` (uuid, references restaurants)
- `total_price` (decimal)
- `payment_method` (text)
- `order_status` (text: 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled')
- `delivery_address` (text)
- `contact_number` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, references orders)
- `product_id` (uuid, references products)
- `quantity` (integer)
- `size` (text)
- `price` (decimal)
- `created_at` (timestamptz)

---

## 🎨 Screenshots

_Add your application screenshots here_

### Home Page
![Home Page](screenshots/home.png)

### Restaurant Menu
![Restaurant Menu](screenshots/menu.png)

### Shopping Cart
![Shopping Cart](screenshots/cart.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin.png)

---

## 🔐 Security Features

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC)
- Protected routes on frontend
- Secure password hashing
- SQL injection prevention

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📧 Contact

For questions or support, please contact the development team.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Developed with [Vite](https://vite.dev/)

---

<div align="center">
  <p>Made with ❤️ by the SB Foods Team</p>
</div>

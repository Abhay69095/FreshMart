import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Categories } from './pages/Categories';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { MyOrders } from './pages/MyOrders';
import { OrderDetails } from './pages/OrderDetails';
import { Wishlist } from './pages/Wishlist';
import { UserProfile } from './pages/UserProfile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminStoreProfile } from './pages/admin/AdminStoreProfile';
import { AdminBilling } from './pages/admin/AdminBilling';
import { AdminPrintInvoice } from './pages/admin/AdminPrintInvoice';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Customer Facing Storefront */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="categories" element={<Categories />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:id" element={<OrderSuccess />} />
                <Route path="my-orders" element={<MyOrders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Vendor Admin Protected Portal */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="store" element={<AdminStoreProfile />} />
              </Route>

              {/* Dedicated Full-Page Customer Billing & Statement Print Pages */}
              <Route path="/admin/billing/print/:id" element={<AdminPrintInvoice />} />
              <Route path="/admin/billing/statement/:customerId" element={<AdminPrintInvoice isStatementMode />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

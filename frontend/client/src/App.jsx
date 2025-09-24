import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import CustomerDashboard from './components/CustomerDashboard/CustomerDashboard';
import DeliveryDashboard from './components/DeliveryDashboard/DeliveryDashboard';

const AppRoutes = ({ user, setUser, orders, setOrders }) => {
  const handleLogout = () => setUser(null);

  // ---- Order Functions ----
  const addOrder = (order) => {
    setOrders((prev) => [
      ...prev,
      { ...order, id: Date.now(), status: 'pending' }
    ]);
  };

  const updateOrder = (orderId, updatedData) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...updatedData } : order
      )
    );
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const getCustomerOrders = (customerId) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Login / Signup */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.type === 'customer'
                  ? '/customer-dashboard'
                  : '/delivery-dashboard'
              }
            />
          ) : (
            <LoginScreen setUser={setUser} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate
              to={
                user.type === 'customer'
                  ? '/customer-dashboard'
                  : '/delivery-dashboard'
              }
            />
          ) : (
            <LoginScreen setUser={setUser} />
          )
        }
      />

      {/* Customer Dashboard */}
      <Route
        path="/customer-dashboard"
        element={
          user && user.type === 'customer' ? (
            <CustomerDashboard
              user={user}
              logout={handleLogout}
              addOrder={addOrder}
              updateOrder={updateOrder}
              deleteOrder={deleteOrder}
              getCustomerOrders={getCustomerOrders}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Delivery Dashboard */}
      <Route
        path="/delivery-dashboard"
        element={
          user && user.type === 'delivery' ? (
            <DeliveryDashboard
              user={user}
              logout={handleLogout}
              orders={orders}
              updateOrder={updateOrder}
              deleteOrder={deleteOrder}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

const App = () => {
  const [user, setUser] = useState(null); // logged-in user
  const [orders, setOrders] = useState([]); // all orders

  return (
    <Router>
      <AppRoutes
        user={user}
        setUser={setUser}
        orders={orders}
        setOrders={setOrders}
      />
    </Router>
  );
};

export default App;
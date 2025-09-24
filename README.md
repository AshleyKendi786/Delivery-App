 # Delivery App

A full-stack delivery management system built with React (Vite) on the frontend and Flask + SQLAlchemy on the backend.
It allows customers to place orders and delivery staff to manage them

# Features
## Authentication
  - User can signup and login
  - User can logout

# Users
## Two roles:
  - Customer → place and view orders.
  - Delivery → view and update order status.

# Orders
## Customers can:
  - Place new orders (product + address).
  - View their own orders.

## Delivery staff can:
  - View all orders.
  - Update status: pending → start delivery → delivered.
  - Delete orders if needed.

# Tech Stack
## Frontend
  - React (Vite)
  - React Router
  - Fetch API
  - CSS

## Backend
  - Flask
  - Flask-SQLAlchemy
  - Flask-CORS
  - SQLite

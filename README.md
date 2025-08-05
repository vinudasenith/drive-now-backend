# 🚗 Drive-Now Backend

## 📘 Overview

Drive-Now is a full-stack car rental service built using the MERN stack. This repository contains the backend of the application, developed with Node.js, Express.js, and MongoDB. The backend provides a RESTful API to handle vehicle management, user authentication, booking operations, and admin functionalities.

![Login Postman](https://github.com/vinudasenith/drive-now-backend/blob/master/screenshots/Screenshot%20(238).png)

## ✨ Features
### 👤 User Features
- **Vehicle Listing**: Retrieve a list of available vehicles with filtering options.
- **Booking System**: Create, view, and manage bookings.
- **User Authentication**: Secure registration and login using JWT.

### 🛠️ Admin Features
- **Vehicle Management**: Add, update, or delete vehicles.
- **User Management**: View, block, or unblock users.
- **Order Management**: Confirm or cancel bookings.
- **Secure Endpoints**: Role-based access control for admin routes.

## 🧰 Technologies Used
- **Node.js**: Runtime environment for the backend.
- **Express.js**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing vehicles, users, and bookings.
- **Mongoose**: ODM for MongoDB to manage schema and queries.
- **JWT**: For secure authentication and authorization.
- **Bcrypt**: For password hashing.
- **dotenv**: For environment variable management.

## ✅ Prerequisites
- Node.js (v16.x or higher)
- npm (v8.x or higher)
- MongoDB (local or MongoDB Atlas)
- A MongoDB connection string

## ⚙️ Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/drive-now-backend.git
   cd drive-now-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Application**
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3000`.


## 🗂️ Project Structure
```
drive-now-backend/
|             
├── controllers/          # Request handlers for routes
├── models/               # Mongoose schemas (User, Vehicle, Booking)
├── routes/               # API route definitions
├── .env                  # Environment variables
├── index.js              # Entry point     
├── package.json          # Project dependencies and scripts  
       

```

## 📜 Available Scripts
- `npm start`: Runs the server in production mode.
- `npm test`: Runs the test suite (if configured).

## API Endpoints
### 🌐 Public Routes
- `POST /api/users`: Register a new user.
- `POST /api/users/login`: Authenticate a user and return a JWT.
- `POST /api/bookings`: Create a new booking.

### 🔒 Admin Routes (Protected)
- `GET /api/users/all`: Get a list of all users.
- `PUT /api/users/block/:email`: Block/unblock a user.
- `POST /api/products`: Add a new vehicle.
- `PUT /api/products/:key`: Update a vehicle.
- `DELETE /api/products/:key`: Delete a vehicle.
- `PUT /api/orders/status/:orderId`: Confirm or Cancel a booking.


## 🛡️ Authentication
- All protected routes require a JWT token in the `Authorization` header as `Bearer <token>`.
- Admin routes are restricted to users with an `admin` role, enforced via middleware.

## 📝 License
This project is licensed under the MIT License.

📸 Postman API Demo

![admin login](https://github.com/vinudasenith/drive-now-backend/blob/master/screenshots/Screenshot%202025-08-04%20182140.png)

![all vehicles](https://github.com/vinudasenith/drive-now-backend/blob/master/screenshots/Screenshot%202025-08-04%20182415.png)

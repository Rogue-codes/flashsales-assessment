# flashsales-assessment

# Happy Store

Happy Store is an e-commerce application built with TypeScript, Express, and MongoDB. This application supports user registration, email verification, product management, sales events, and order processing.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/happy-store.git
    cd happy-store
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/1) file in the root directory and add the following environment variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    USERNAME=your_email_username
    APP_PASSWORD=your_email_app_password
    ```

4. For development, you can use:
    ```sh
    npm run dev
    ```

## Usage

Once the server is running, you can access the API at `http://localhost:5000/api/v1/happy-store`.

## Project Structure

### Key Files and Directories

- **configs/db.ts**: Database connection configuration.
- **controllers/**: Contains the logic for handling requests and responses.
- **cron/salesEventCron.ts**: Cron job for activating sales events.
- **events/userEvents.ts**: Event handling for user-related events.
- **middleware/**: Middleware functions for authentication and sales event checks.
- **models/**: Mongoose models for the database.
- **routes/**: API route definitions.
- **service/emailService.ts**: Email service for sending verification codes.
- **utils/**: Utility functions.

## API Endpoints

### User Routes

- **POST /user/register**: Register a new user.
- **POST /user/verify**: Verify user email.
- **POST /user/login**: User login.

### Product Routes

- **POST /product/create**: Create a new product (Admin only).
- **GET /product/all**: Get all products with pagination and search.
- **GET /product/:id**: Get a product by ID.
- **PUT /product/modify/:id**: Update a product by ID.
- **DELETE /product/delete/:id**: Delete a product by ID.

### Sales Event Routes

- **POST /sales-event/create**: Create a new sales event (Admin only).
- **GET /sales-event/all**: Get all sales events with pagination and search.
- **GET /sales-event/:id**: Get a sales event by ID.
- **PUT /sales-event/modify/:id**: Update a sales event by ID.
- **DELETE /sales-event/delete/:id**: Delete a sales event by ID.

### Order Routes

- **POST /order/create**: Create a new order (Authenticated users only).
- **GET /order/leaderboard**: Get the leaderboard of orders.

## Environment Variables

- **PORT**: The port on which the server will run.
- **MONGO_URI**: The MongoDB connection string.
- **JWT_SECRET**: The secret key for JWT token generation.
- **USERNAME**: The email username for sending emails.
- **APP_PASSWORD**: The email app password for sending emails.



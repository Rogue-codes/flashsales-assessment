# Happy Store

Happy Store is an e-commerce application built with TypeScript, Express, and MongoDB. This application supports user registration, email verification, product management, sales events, and order processing.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [User Flow](#user-flow)
- [Product Creation Flow](#product-creation-flow)
- [Sales Event Creation Flow](#sales-event-creation-flow)
- [Relationship Between SalesEvent and Product](#relationship-between-salesevent-and-product)
- [Order Creation Flow](#order-creation-flow)
- [Handling Race Conditions](#handling-race-conditions)
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

3. Create a [.env](http://_vscodecontentref_/0) file in the root directory and add the following environment variables:
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
- **MONGO_URI**: The  connectionMongoDB string.
- **JWT_SECRET**: The secret key for JWT token generation.
- **USERNAME**: The email username for sending emails.
- **APP_PASSWORD**: The email app password for sending emails.

## User Flow

The system supports two types of users: admin and normal users. The user flow is as follows:

1. **Account Creation**: 
   - A user creates an account by providing their details, including email, phone number, first name, last name, and password.
   - The system checks if the email or phone number already exists in the database. If either exists, the user is informed that the email or phone number is already in use.

2. **Email Verification**:
   - After successfully creating an account, the user receives a verification code via email.
   - The user must verify their email by submitting the verification code.
   - Upon successful verification, the user's `isVerified` status is set to `true`, and the account becomes active.

3. **Login**:
   - The user can log in by providing their email and password.
   - The system verifies the credentials and, if valid, generates a JWT token for the user.

4. **Forgot Password**:
   - If a user forgets their password, they can request a password reset by providing their email.
   - The system sends an OTP (One-Time Password) to the user's email.
   - The user must submit the OTP along with a new password to reset their password.

5. **Reset Password**:
   - The user provides their email, the OTP received, and a new password.
   - The system verifies the OTP and, if valid, updates the user's password.

This flow ensures that user accounts are secure and that only verified users can access the system.

## Product Creation Flow

The system allows only admin users to create products. The product creation flow is as follows:

1. **Admin Authentication**:
   - The admin user must be authenticated by logging in with their credentials (email and password).
   - Upon successful login, the system generates a JWT token for the admin user.

2. **Product Creation**:
   - The authenticated admin user sends a request to create a new product.
   - The request must include the product details such as name, description, price, and any other relevant information.

3. **Authorization Check**:
   - The system verifies the JWT token to ensure the request is made by an authenticated admin user.
   - If the token is valid and the user has admin privileges, the system proceeds with the product creation.

4. **Product Validation**:
   - The system validates the provided product details to ensure all required fields are present and correctly formatted.
   - If any required fields are missing or invalid, the system responds with an error message indicating the issues.

5. **Product Storage**:
   - Once the product details are validated, the system stores the new product in the database.
   - The system generates a unique identifier for the product and saves all relevant information.

6. **Response**:
   - The system responds with a success message indicating that the product has been created successfully.
   - The response includes the details of the newly created product.

This flow ensures that only authenticated admin users can create products, and that all product details are validated before being stored in the database.

## Sales Event Creation Flow

The system allows only admin users to create sales events. The sales event creation flow is as follows:

1. **Admin Authentication**:
   - The admin user must be authenticated by logging in with their credentials (email and password).
   - Upon successful login, the system generates a JWT token for the admin user.

2. **Sales Event Creation**:
   - The authenticated admin user sends a request to create a new sales event.
   - The request must include the sales event details such as name, description, start date, and end date.

3. **Authorization Check**:
   - The system verifies the JWT token to ensure the request is made by an authenticated admin user.
   - If the token is valid and the user has admin privileges, the system proceeds with the sales event creation.

4. **Sales Event Validation**:
   - The system validates the provided sales event details to ensure all required fields are present and correctly formatted.
   - If any required fields are missing or invalid, the system responds with an error message indicating the issues.

5. **Sales Event Storage**:
   - Once the sales event details are validated, the system stores the new sales event in the database.
   - The system generates a unique identifier for the sales event and saves all relevant information.

6. **Response**:
   - The system responds with a success message indicating that the sales event has been created successfully.
   - The response includes the details of the newly created sales event.

7. **Sales Event Activation**:
   - The system automatically activates the sales event based on the start date.
   - A cron job or scheduled task checks for sales events that need to be activated and updates their `isActive` status to `true`.

This flow ensures that only authenticated admin users can create sales events, and that all sales event details are validated before being stored in the database. Additionally, the system handles the automatic activation of sales events based on their start date.

## Relationship Between SalesEvent and Product

In the Happy Store application, there is a relationship between `SalesEvent` and `Product`. This relationship allows products to be associated with specific sales events, enabling the system to manage and display products that are part of a sales event.

### SalesEvent Model

The `SalesEvent` model represents a sales event in the system. It includes details such as the name, description, start date, end date, and whether the event is active.

```typescript
import mongoose, { Schema, Document } from "mongoose";

export enum DISCOUNT_TYPE {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export enum SCHEDULE_OPTION {
  ONE_OFF = "one-off",
  REOCCURING = "reoccuring",
}

export interface ISalesEvent extends Document {
  title: string;
  description?: string;
  discountType: DISCOUNT_TYPE;
  discountValue: number;
  startDate: Date;
  startTime: string;
  isActive: boolean;
  scheduleOption: SCHEDULE_OPTION;
  products: {
    productId: mongoose.Types.ObjectId;
    price: number;
    stockCount: number;
  }[];
  nextStartDate: Date; // if scheduleOption is set to reoccuring, the next start date should be provided
}

const SalesEventSchema: Schema<ISalesEvent> = new Schema(
  {
    title: { type: String, required: true, trim: true, unique:true},
    description: { type: String, trim: true },
    discountType: { type: String, enum: DISCOUNT_TYPE, required: true },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
    },
    isActive: { type: Boolean, default: false },
    scheduleOption: { type: String, enum: SCHEDULE_OPTION, required: true },
    nextStartDate: { type: Date, default: null },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        stockCount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Auto activate event if scheduled and within time range
SalesEventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.startDate <= now) {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
  next();
});
export default mongoose.model<ISalesEvent>('SalesEvent', SalesEventSchema);

Product Model
The Product model represents a product in the system. It includes details such as the name, description, price, and a reference to the associated sales event.

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salesEvent: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salesEvent: { type: mongoose.Types.ObjectId, ref: 'SalesEvent' },
});

export default mongoose.model<IProduct>('Product', ProductSchema);

Relationship
The relationship between SalesEvent and Product is established through the salesEvent field in the Product model. This field is a reference to the SalesEvent model, indicating that a product can be associated with a specific sales event.

One-to-Many Relationship: A single sales event can have multiple products associated with it. This is represented by the salesEvent field in the Product model, which references the _id of a SalesEvent.
Example Usage
When creating a product, the admin user can specify the salesEvent to which the product belongs. This allows the system to manage and display products that are part of a sales event.

const newProduct = new Product({
  name: 'Product Name',
  description: 'Product Description',
  price: 100,
  salesEvent: salesEventId, // Reference to the associated sales event
});

await newProduct.save();

his relationship ensures that products can be organized and managed within the context of sales events, providing a seamless experience for both admins and users.

Order Creation Flow
The system allows authenticated users to create orders. The order creation flow is as follows:

User Authentication:

The user must be authenticated by logging in with their credentials (email and password).
Upon successful login, the system generates a JWT token for the user.
Order Creation:

The authenticated user sends a request to create a new order.
The request must include the order details such as the product IDs, quantities, and any other relevant information.
Authorization Check:

The system verifies the JWT token to ensure the request is made by an authenticated user.
If the token is valid, the system proceeds with the order creation.
Order Validation:

The system validates the provided order details to ensure all required fields are present and correctly formatted.
The system checks the availability of the products and their stock counts.
If any required fields are missing, invalid, or if the products are out of stock, the system responds with an error message indicating the issues.
Order Processing:

Once the order details are validated, the system processes the order.
The system updates the stock counts of the ordered products.
The system calculates the total price of the order based on the product prices and quantities.
Order Storage:

The system stores the new order in the database.
The system generates a unique identifier for the order and saves all relevant information.
Response:

The system responds with a success message indicating that the order has been created successfully.
The response includes the details of the newly created order, such as the order ID, product details, quantities, and total price.
This flow ensures that only authenticated users can create orders, and that all order details are validated before being processed and stored in the database.

Handling Race Conditions
Race conditions can occur when multiple processes or threads attempt to modify shared data concurrently. In the Happy Store application, race conditions are handled using the following strategies:

Atomic Operations:

Atomic operations ensure that a sequence of operations is completed without interruption. For example, updating the stock count of a product is performed as an atomic operation to prevent race conditions.
Database Transactions:

Database transactions are used to ensure that a series of database operations are executed as a single unit. If any operation in the transaction fails, the entire transaction is rolled back, ensuring data consistency.
Optimistic Locking:

Optimistic locking is used to handle concurrent updates to the same data. Each record includes a version number that is incremented with each update. When updating a record, the system checks the version number to ensure that the record has not been modified by another process.
Pessimistic Locking:

Pessimistic locking locks the data when it is being read or modified, preventing other processes from accessing the data until the lock is released. This approach is used in scenarios where the likelihood of concurrent modifications is high.
Queueing:

Queueing requests ensures that they are processed in a controlled manner, preventing concurrent access to shared resources. For example, order processing requests can be queued to ensure that they are handled sequentially.
By implementing these strategies, the Happy Store application ensures data consistency and prevents race conditions, providing a reliable and robust system for managing e-commerce operations.


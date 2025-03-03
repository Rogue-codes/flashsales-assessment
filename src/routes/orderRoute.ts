import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { createOrder } from "../controllers/orderController";

const orderRoute = express.Router();

orderRoute.post("/order/create", authenticateUser, createOrder);


export default orderRoute;
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Order from "../models/ordersModel";
import SalesEvent from "../models/salesEventModel";
import mongoose from "mongoose";

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  const { salesEventId, products } = req.body;

  if (!salesEventId) {
    return res.status(400).json({ success: false, message: "salesEventId is required" });
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: "At least one product is required" });
  }

  const user = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const salesEvent = await SalesEvent.findById(salesEventId).session(session);
    if (!salesEvent) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Sales event not found" });
    }

    // Ensure stock availability & reduce stock
    for (const item of products) {
      const productInEvent = salesEvent.products.find((p) => p.productId.toString() === item.productId);

      if (!productInEvent) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found in sales event`,
        });
      }

      if (productInEvent.stockCount < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${item.productId}. Available: ${productInEvent.stockCount}`,
        });
      }

      productInEvent.stockCount -= item.quantity; // Reduce stock
    }

    // Save updated sales event
    await salesEvent.save({ session });

    // Create order
    const newOrder = await Order.create(
      [{ user, salesEventId, products, totalAmount: calculateTotal(products) }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error placing order:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};

// Helper function to calculate total amount
const calculateTotal = (products: { price: number; quantity: number }[]) => {
  return products.reduce((sum, item) => sum + item.price * item.quantity, 0);
};


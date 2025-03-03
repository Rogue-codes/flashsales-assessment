import { Request, Response } from "express";
import mongoose from "mongoose";
import salesEventModel from "../models/salesEventModel";
import orderModel from "../models/orderModel";
import productModel from "../models/productModel";
import { AuthRequest } from "../middleware/authMiddleware";

// Create an order (Purchase product in flash sale)
export const createOrder = async (req: AuthRequest, res: Response):Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // Find active sales event for this product
    const activeSale = await salesEventModel.findOne({ 
      "products.productId": productId, 
      isActive: true 
    }).session(session);

    if (!activeSale) {
      return res.status(400).json({ success: false, message: "No active sale for this product" });
    }

    // Check if product exists
    const product = await productModel.findById(productId).session(session);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Get the product details from the active sale
    const saleProduct = activeSale.products.find(p => p.productId.toString() === productId);
    if (!saleProduct || saleProduct.stockCount < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    // Calculate total amount
    const totalAmount = saleProduct.price * quantity;

    // Deduct stock from sales event
    saleProduct.stockCount -= quantity;
    await activeSale.save({ session });

    // Create order record
    const order = await orderModel.create([{ 
      user: user._id, 
      product: productId, 
      quantity, 
      totalAmount 
    }], { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Purchase successful",
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order creation error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get the leaderboard (sorted by purchase time)
export const getLeaderboard = async (req: Request, res: Response):Promise<any> => {
  try {
    const leaderboard = await orderModel
      .find()
      .populate("user", "name email")  // Populate user info
      .sort({ createdAt: 1 })  // Sort by earliest purchase
      .limit(50); // Limit to top 50

    return res.status(200).json({
      success: true,
      message: "Leaderboard retrieved successfully",
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

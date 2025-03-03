import { Request, Response } from "express";
import mongoose from "mongoose";
import salesEventModel from "../models/salesEventModel";
import { AuthRequest } from "../middleware/authMiddleware";
import ordersModel from "../models/ordersModel";

// Create an order (Purchase product in flash sale)
export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { salesEventId, productId, quantity } = req.body;
    const user = req.user;

    if (!salesEventId || !productId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // Find the specific active sales event
    const activeSale = await salesEventModel.findOne({
      _id: salesEventId, 
      "products.productId": productId,
      isActive: true,
    }).session(session);

    if (!activeSale) {
      return res.status(400).json({ success: false, message: "No active sale for this product" });
    }

    // Get the product details from the sales event
    const saleProduct = activeSale.products.find(p => p.productId.toString() === productId);
    if (!saleProduct || saleProduct.stockCount < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    // Calculate total amount
    const totalAmount = saleProduct.price * quantity;

    // Deduct stock from the specific sales event
    saleProduct.stockCount -= quantity;
    await activeSale.save({ session });

    // Create order record, linking to sales event
    const order = await ordersModel.create([{ 
      user: user._id, 
      product: productId, 
      quantity, 
      totalAmount,
      salesEvent: salesEventId
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
export const getLeaderboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const { salesEventId } = req.params; 

    if (!salesEventId) {
      return res.status(400).json({ success: false, message: "Sales event ID is required" });
    }

    const leaderboard = await ordersModel
      .find({ salesEvent: salesEventId }) 
      .populate("user", "name email") // Populate user info
      .sort({ createdAt: -1 }) // Sort by latest purchase first
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

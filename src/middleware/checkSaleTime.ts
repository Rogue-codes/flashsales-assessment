import { Request, Response, NextFunction } from "express";
import salesEventModel from "../models/salesEventModel";

export const checkSaleTime = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  const { productId } = req.body;
  const now = new Date();

  const activeSale = await salesEventModel.findOne({
    "products.productId": productId,
    isActive: true,
    startDate: { $lte: now },
  });

  if (!activeSale) {
    return res.status(403).json({ success: false, message: "Sale not started yet or inactive" });
  }

  next();
};

import { Request, Response, NextFunction } from "express";
import salesEventModel from "../models/salesEventModel";

export const checkSaleTime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { salesEventId } = req.body;
  if (!salesEventId) {
    return res.status(400).json({
      success: false,
      message: "salesEventId is required",
    });
  }
  const now = new Date();

  const activeSale = await salesEventModel.findOne({
    isActive: true, // Only active sales events
    $expr: {
      $lt: [
        {
          $dateFromString: {
            dateString: {
              $concat: [
                { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } }, // Convert `startDate` to string
                "T",
                "$startTime", // Append `startTime`
              ],
            },
            format: "%Y-%m-%dT%H:%M:%S", // Ensure format matches ISO 8601
          },
        },
        now,
      ],
    },
  });
  

  console.log("active sale:  ", activeSale);

  if (!activeSale) {
    return res
      .status(403)
      .json({ success: false, message: "Sale not started yet or inactive" });
  }

  next();
};

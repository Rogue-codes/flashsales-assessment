import { Request, Response } from "express";
import salesEventModel, {
  DISCOUNT_TYPE,
  SCHEDULE_OPTION,
} from "../models/salesEventModel";
import { AuthRequest } from "../middleware/authMiddleware";
import productModel from "../models/productModel";

// Create a new sales event
export const createSalesEvent = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (
      !validateReq(req, res, [
        "title",
        "discountType",
        "discountValue",
        "startDate",
        "startTime",
        "scheduleOption",
        "products",
      ])
    ) {
      return;
    }

    const {
      title,
      discountType,
      discountValue,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      scheduleOption,
      products,
      nextStartDate,
    } = req.body;

    // Ensure user is an admin before proceeding
    const user = req.user;
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // prevent title duplicate
    const existingSaleEventTitle = await salesEventModel.findOne({ title });

    if (existingSaleEventTitle) {
      return res.status(409).json({
        success: false,
        message: `sales event with title: ${title} already exist`,
      });
    }

    // Validate reoccurring event requires nextStartDate
    if (scheduleOption === SCHEDULE_OPTION.REOCCURING && !nextStartDate) {
      return res.status(400).json({
        success: false,
        message: "For a reoccurring sales event, nextStartDate is required",
      });
    }

    // Process products and apply discounts
    const updatedProducts = await Promise.all(
      products.map(async (product_: any) => {
        const product = await productModel.findById(product_.productId);

        if (!product) {
          throw new Error(`Product with ID ${product_.productId} not found`);
        }

        return {
          ...product_,
          price:
            discountType === DISCOUNT_TYPE.FIXED
              ? product.price - discountValue
              : product.price - product.price * (discountValue / 100),
        };
      })
    );

    // Create sales event with updated product prices
    const salesEvent = await salesEventModel.create({
      title,
      discountType,
      discountValue,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      scheduleOption,
      products: updatedProducts,
      nextStartDate:
        scheduleOption === SCHEDULE_OPTION.REOCCURING ? nextStartDate : null,
    });

    return res.status(201).json({
      success: true,
      message: `Sales event "${title}" created successfully`,
      data: salesEvent,
    });
  } catch (error) {
    console.error("Error creating sales event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Get all sales events with pagination and search
export const getAllSalesEvents = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { page = 1, limit = 10, search = "", isActive } = req.query;

    const query: any = {};

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by active/inactive status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const salesEvents = await salesEventModel
      .find(query)
      .populate({
        path: "products.productId",
        model: productModel,
        select: "-price -stock", // Exclude price and stock fields
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sort by most recent

    const totalCount = await salesEventModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Sales events retrieved successfully",
      data: salesEvents,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching sales events:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Get a single sales event by ID
export const getSalesEventById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const salesEvent = await salesEventModel.findById(id).populate({
      path: "products.productId",
      model: productModel,
      select: "-price -stock", // Exclude sensitive fields
    });

    if (!salesEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Sales event not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Sales event retrieved successfully",
      data: salesEvent,
    });
  } catch (error) {
    console.error("Error fetching sales event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Update a sales event
export const updateSalesEvent = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const salesEvent = await salesEventModel.findById(id);
    if (!salesEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Sales event not found" });
    }

    // If products are updated, recalculate their discounted prices
    if (updateData.products) {
      updateData.products = await Promise.all(
        updateData.products.map(async (product_: any) => {
          const product = await productModel.findById(product_.productId);
          if (!product) {
            throw new Error(`Product with ID ${product_.productId} not found`);
          }

          return {
            ...product_,
            price:
              updateData.discountType === DISCOUNT_TYPE.FIXED
                ? product.price - updateData.discountValue
                : product.price -
                  product.price * (updateData.discountValue / 100),
          };
        })
      );
    }

    const updatedSalesEvent = await salesEventModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: "products.productId",
        model: productModel,
        select: "-price -stock",
      });

    return res.status(200).json({
      success: true,
      message: "Sales event updated successfully",
      data: updatedSalesEvent,
    });
  } catch (error) {
    console.error("Error updating sales event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Delete a sales event
export const deleteSalesEvent = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const salesEvent = await salesEventModel.findById(id);
    if (!salesEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Sales event not found" });
    }

    await salesEventModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Sales event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sales event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Automatically update recurring events
// export const handleRecurringEvents = async () => {
//   try {
//     const now = new Date();

//     const recurringEvents = await SalesEvent.find({
//       scheduleOption: "reoccuring",
//       endDate: { $lt: now },
//     });

//     for (const event of recurringEvents) {
//       if (event.nextStartDate) {
//         event.startDate = event.nextStartDate;
//         event.endDate = new Date(
//           new Date(event.nextStartDate).getTime() +
//             (event.endDate.getTime() - event.startDate.getTime())
//         );
//         event.nextStartDate = null;
//         event.isActive = true;
//         await event.save();
//       }
//     }
//   } catch (error) {
//     console.error("Error handling recurring sales events:", error);
//   }
// };

const validateReq = (
  req: Request,
  res: Response,
  requiredFields: string[]
): boolean => {
  // Check for missing fields
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
    return false;
  }

  // Validate product stock
  const products = req.body.products as {
    productId: string;
    stockCount: number;
  }[];

  if (!Array.isArray(products)) {
    res.status(400).json({
      success: false,
      message: "Products must be an array",
    });
    return false;
  }

  for (const product of products) {
    if (product.stockCount < 200) {
      res.status(400).json({
        success: false,
        message: "All products must have a stock count of at least 200 items",
      });
      return false;
    }
  }

  return true;
};

// Run the function every 1 hour (you can call this from a cron job)
// setInterval(handleRecurringEvents, 60 * 60 * 1000);

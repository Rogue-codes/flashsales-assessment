import { Request, Response } from "express";
import productModel from "../models/productModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (!validateReq(req, res, ["name", "price"])) {
      return;
    }
    const { name, price, description, category, stock } = req.body;

    const user = req.user;

    console.log(user);

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "unauthorised",
      });
    }

    // Create a new product
    const product = await productModel.create({
      name,
      price,
      description,
      category,
      stock,
    });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Convert `page` and `limit` to numbers
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;

    // Build search query
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } } 
      : {};

    // Fetch products with pagination and search
    const products = await productModel
      .find(searchQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Count total documents for pagination metadata
    const totalProducts = await productModel.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;

    const product = await productModel.findByIdAndUpdate(
      id,
      { name, price, description, category },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const validateReq = (
  req: Request,
  res: Response,
  requiredFields: string[]
): boolean => {
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
    return false;
  }

  return true;
};

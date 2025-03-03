import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController";
import { authenticateUser } from "../middleware/authMiddleware";

const productRoute = express.Router();

productRoute.post("/product/create", authenticateUser, createProduct);
productRoute.get("/product/all", getAllProducts);
productRoute.get("/product/:id", getProductById);
productRoute.put("/product/modify/:id", updateProduct);
productRoute.delete("/product/delete/:id", deleteProduct);

export default productRoute;
import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { createSalesEvent, deleteSalesEvent, getAllSalesEvents, getSalesEventById, updateSalesEvent } from "../controllers/salesEventController";
import { deleteProduct } from "../controllers/productController";

const salesEventRoute = express.Router();

salesEventRoute.post("/sales-event/create", authenticateUser, createSalesEvent);
salesEventRoute.get("/sales-event/all", getAllSalesEvents);
salesEventRoute.get("/sales-event/:id", getSalesEventById);
salesEventRoute.put("/sales-event/modify/:id", updateSalesEvent);
salesEventRoute.delete("/sales-event/delete/:id", deleteSalesEvent);


export default salesEventRoute;
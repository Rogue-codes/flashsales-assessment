import express from "express";
import { createOrder, getLeaderboard } from "../controllers/orderController";
import { authenticateUser } from "../middleware/authMiddleware";
import { checkSaleTime } from "../middleware/checkSaleTime";

const router = express.Router();

router.post("/order/create", authenticateUser, checkSaleTime, createOrder);
router.get("/order/:salesEventId/leaderboard", getLeaderboard);

export default router;

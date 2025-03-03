import express from "express";
import { createUser, forgotPassword, login, resetPassword, verifyEmail } from "../controllers/userController"; // ✅ Ensure correct import

const userRoute = express.Router();

userRoute.post("/user/register", createUser);
userRoute.post("/user/verify", verifyEmail);
userRoute.post("/user/login", login);
userRoute.post("/user/forgot-password", forgotPassword);
userRoute.post("/user/reset-password", resetPassword);

export default userRoute;

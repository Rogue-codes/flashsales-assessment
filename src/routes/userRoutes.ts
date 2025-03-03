import express from "express";
import { createUser, login, verifyEmail } from "../controllers/userController"; // ✅ Ensure correct import

const userRoute = express.Router();

userRoute.post("/user/register", createUser);
userRoute.post("/user/verify", verifyEmail);
userRoute.post("/user/login", login);

export default userRoute;

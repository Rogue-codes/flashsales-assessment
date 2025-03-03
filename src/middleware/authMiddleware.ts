import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userModel from "../models/userModel";

dotenv.config();

// Extend Request type 
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction):Promise<any> => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = await userModel.findById(decoded.id).select("-password"); // Assign user to request

        if (!req.user) {
            return res.status(401).json({ message: "Invalid token. User not found." });
        }

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

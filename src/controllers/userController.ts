import { Request, Response } from "express";
import userModel from "../models/userModel";
import { serializeResponse } from "../utils/utils";
import { eventEmitter, EventTypes } from "../events/userEvents";
import { sendVerificationCode } from "../service/emailService";
import Otp from "../models/otpModel";
import bcrypt from "bcrypt";
import { genToken } from "../utils/genToken";

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // Return early if validation fails
    if (
      !validateReq(req, res, [
        "email",
        "firstName",
        "lastName",
        "phone",
        "password",
      ])
    ) {
      return;
    }

    const { email, firstName, lastName, phone, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone";
      return res.status(409).json({
        success: false,
        message: `${field}: ${
          existingUser.email === email ? email : phone
        } already exists`,
      });
    }

    const newUser = await userModel.create({
      email,
      firstName,
      lastName,
      phone,
      password,
    });

    // emit an event to send welcome email
    eventEmitter.emit(EventTypes.SEND_WELCOME_EMAIL, {
      name: newUser.firstName,
      email: newUser.email,
    });

    return res.status(201).json({
      success: true,
      message: "User creation successful",
      data: serializeResponse(newUser),
    });
  } catch (error: any) {
    console.log(error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!validateReq(req, res, ["email", "code"])) {
      return;
    }
    const { email, code } = req.body;

    //check if email exists
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: `user with email ${email} does not exist`,
      });
    }

    const validOtp = await Otp.findOne({ email });

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: "invalid otp code",
      });
    }

    // check if verification token has expired
    if (new Date(validOtp?.expiresAt as Date).getTime() < Date.now()) {
      return res.status(400).json({
        status: "Failed",
        message: "Verification code has expired",
      });
    }

    //compare verification code
    const validCode = await bcrypt.compare(code, validOtp.code as string);

    if (!validCode) {
      return res.status(400).json({
        status: "Failed",
        message: "Verification code is not valid",
      });
    }

    // set the isVerified boolean to true
    user.isVerified = true;
    user.isActive = true;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "account verified successfully.",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!validateReq(req, res, ["email", "password"])) {
      return;
    }

    const { email, password } = req.body;
    //check if email exists
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const validPassword: boolean = await user.confirmPassword(password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "invalid credentials",
      });
    }

    // generate token and sign user in
    const token = genToken(user._id);

    res.status(200).json({
      status: "Success",
      message: "Login successful",
      data: serializeResponse(user),
      access_token: token,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// forgot password
export const forgotPassword = async (req: Request, res: Response) => {};

// reset password
export const resetPassword = async (req: Request, res: Response) => {};

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

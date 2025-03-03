import { EventEmitter } from "events";
import { sendForgotPasswordEmail, sendVerificationCode } from "../service/emailService";
import Otp from "../models/otpModel";
import bcrypt from "bcrypt";

export const eventEmitter = new EventEmitter();

export enum EventTypes {
  SEND_WELCOME_EMAIL = "SEND_WELCOME_EMAIL",
  SEND_FORGOT_PASSWORD_EMAIL = "SEND_FORGOT_PASSWORD_EMAIL",
}

// Register the listener **only once**
eventEmitter.on(EventTypes.SEND_WELCOME_EMAIL, async ({ name, email }) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const salt = await bcrypt.genSalt(10)
    const hashedOtp = await bcrypt.hash(code,salt)

    await Otp.create({
      email,
      code: hashedOtp,
      expiresAt
    });
    
    await sendVerificationCode(email, code, name);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
});

eventEmitter.on(EventTypes.SEND_FORGOT_PASSWORD_EMAIL, async ({ name, email, code }) => {
  try {
    await sendForgotPasswordEmail(email, code, name);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
});

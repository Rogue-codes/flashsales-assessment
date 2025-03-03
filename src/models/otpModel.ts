import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
    email: string;
    code: string;
    expiresAt: Date;
}

const OtpSchema: Schema = new Schema<IOtp>({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '5m' } }, // Auto-delete after 5 minutes
});

const Otp = mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;

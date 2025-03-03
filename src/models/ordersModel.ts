import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    salesEvent: { type: mongoose.Schema.Types.ObjectId, ref: "SalesEvent", required: true }, // Add salesEvent reference
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);


export default mongoose.model<IOrder>("Order", OrderSchema);

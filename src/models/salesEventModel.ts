import mongoose, { Schema, Document } from "mongoose";

export enum DISCOUNT_TYPE {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export enum SCHEDULE_OPTION {
  ONE_OFF = "one-off",
  REOCCURING = "reoccuring",
}

export interface ISalesEvent extends Document {
  title: string;
  description?: string;
  discountType: DISCOUNT_TYPE;
  discountValue: number;
  startDate: Date;
  startTime: string;
  isActive: boolean;
  scheduleOption: SCHEDULE_OPTION;
  products: {
    productId: mongoose.Types.ObjectId;
    price: number;
    stockCount: number;
  }[];
  nextStartDate: Date; // if scheduleOption is set to reoccuring, the next start date should be provided
}

const SalesEventSchema: Schema<ISalesEvent> = new Schema(
  {
    title: { type: String, required: true, trim: true, unique:true},
    description: { type: String, trim: true },
    discountType: { type: String, enum: DISCOUNT_TYPE, required: true },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
    },
    isActive: { type: Boolean, default: false },
    scheduleOption: { type: String, enum: SCHEDULE_OPTION, required: true },
    nextStartDate: { type: Date, default: null },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        stockCount: {
          type: Number,
          required: true,
          min: 200,
        },
      },
    ],
  },
  { timestamps: true }
);

// Auto activate event if scheduled and within time range
SalesEventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.startDate <= now) {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
  next();
});

export default mongoose.model<ISalesEvent>("SalesEvent", SalesEventSchema);

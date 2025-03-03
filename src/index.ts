import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoute from "./routes/userRoutes";
import connectDB from "./configs/db";
import morgan from "morgan";
import productRoute from "./routes/productRoute";
import salesEventRoute from "./routes/salesEventRoute";
import activateSalesEvents from "./cron/salesEventCron";
import orderRoute from "./routes/orderRoute";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/v1/happy-store", userRoute);
app.use("/api/v1/happy-store", productRoute);
app.use("/api/v1/happy-store", salesEventRoute);
app.use("/api/v1/happy-store", orderRoute);

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});


// ✅ Connect to DB and Start Server
connectDB().then(() => {
activateSalesEvents();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

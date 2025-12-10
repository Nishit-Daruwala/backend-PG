import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

// Simple health check
app.get("/", (req, res) => {
  res.json({ message: "Hostel PG API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

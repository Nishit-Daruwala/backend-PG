import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:5173",                    // local dev // after hosting
    "https://app-0ce6d237-de03-4e27-ae97-edffedc866a3.cleverapps.io" // backend itself
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.options("*", cors());
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

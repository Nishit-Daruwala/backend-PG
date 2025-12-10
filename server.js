import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

// -------------------- CORS FIX --------------------
app.use(cors({
  origin: [
    "http://localhost:5173",                                    // local dev
    "https://app-0ce6d237-de03-4e27-ae97-edffedc866a3.cleverapps.io", // backend deployed
    "https://<YOUR_NETLIFY_URL>.netlify.app"                    // <-- replace later when frontend deployed
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.options("*", cors());
// ---------------------------------------------------

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Hostel PG API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// -------------------- SERVER LISTEN FIX --------------------
const PORT = process.env.PORT || 8080;

// Must bind 0.0.0.0 to work on Clever Cloud production
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

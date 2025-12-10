import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

// -------------- CORS --------------
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://app-0ce6d237-de03-4e27-ae97-edffedc866a3.cleverapps.io",
    "https://<YOUR_NETLIFY_SITE>.netlify.app"   // <-- Replace after deploy
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
// ---------------------------------

app.use(express.json());

// Health Test
app.get("/", (req, res) => {
  res.json({ message: "Hostel PG API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running on PORT: https://localhost:${PORT}`);
});

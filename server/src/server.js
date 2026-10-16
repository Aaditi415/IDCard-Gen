
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import masterListRoutes from "./routes/masterListRoutes.js";
import idCardFormRoutes from "./routes/idCardFormRoutes.js";
import studentFormConfigRoutes from "./routes/studentFormConfigRoutes.js";
import studentSubmissionRoutes from "./routes/studentSubmissionRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/master-lists", masterListRoutes);
app.use("/api/id-card-forms", idCardFormRoutes);
app.use("/api/student-form-configs",studentFormConfigRoutes);
app.use("/api/student-submissions", studentSubmissionRoutes);

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IDFoundry API is running!",
  });
});

// MongoDB connection status
app.get("/api/db-status", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "Connected" : "Disconnected",
  });
});

// Connect to MongoDB before starting the API

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`IDFoundry API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start IDFoundry:", error.message);
    process.exit(1);
  }
}

startServer();

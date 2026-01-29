import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Custom Mongo Sanitize for Express 5 (req.query is read-only)
app.use((req, res, next) => {
  req.body = mongoSanitize.sanitize(req.body);
  req.params = mongoSanitize.sanitize(req.params);

  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
    // Modifying req.query in place since we can't reassign it
    for (const key in req.query) {
      delete req.query[key];
    }
    for (const key in sanitizedQuery) {
      req.query[key] = sanitizedQuery[key];
    }
  }
  next();
});
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use("/api", limiter);

// Static Asset Serving
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/test", (req, res) => res.send("Backend working fine!"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

export default app;

// Server Start
if (process.env.NODE_ENV !== 'test') {
  // Server Start
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

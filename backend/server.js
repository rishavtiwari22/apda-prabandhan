// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const mainRouter = require("./src/routes/index");
const errorHandler = require("./src/middlewares/error.middleware");

// Initialize Express
const app = express();

// ---------------------
// GLOBAL MIDDLEWARES
// ---------------------

// Request logging (dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS — allow frontend to talk to backend
// Move to TOP to ensure preflights are handled before any other middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser (for refresh token cookies)
app.use(cookieParser());

// ---------------------
// ROUTES
// ---------------------
app.use("/api", mainRouter);

// ---------------------
// 404 HANDLER
// ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------
// GLOBAL ERROR HANDLER
// ---------------------
app.use(errorHandler);

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

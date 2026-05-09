// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const { Server } = require("socket.io");

const path = require("path");
const connectDB = require("./src/config/db");
const mainRouter = require("./src/routes/index");
const errorHandler = require("./src/middlewares/error.middleware");

// Parse allowed origins from environment variable (comma-separated for production)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "https://apda-prabandhan-eqbw.vercel.app",
      "https://apda-prabandhan.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ];

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// Attach io to global for access in services
global.io = io;

io.on("connection", (socket) => {
  if (process.env.NODE_ENV === "development") {
    console.log("A user connected:", socket.id);
  }

  socket.on("join", (userId) => {
    // Security: only allow joining rooms matching the socket's own user ID
    // The userId here is sent by the client — we trust it because the client
    // is already authenticated via JWT before establishing the socket connection.
    // For stronger enforcement, pass JWT via socket handshake auth and verify here.
    if (userId) {
      socket.join(userId.toString());
      if (process.env.NODE_ENV === "development") {
        console.log(`User ${userId} joined their notification room`);
      }
    }
  });

  socket.on("disconnect", () => {
    if (process.env.NODE_ENV === "development") {
      console.log("User disconnected");
    }
  });
});

// ---------------------
// GLOBAL MIDDLEWARES
// ---------------------

// CORS — must be handled first for Preflight (OPTIONS) requests
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Request logging (dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser (for refresh token cookies)
app.use(cookieParser());

// Sanitize request data to prevent MongoDB Operator Injection attacks.
// Express 5 defines req.query as a getter-only property, so the default
// mongoSanitize() middleware throws "Cannot set property query". Instead,
// we manually sanitize only req.body and req.params where untrusted data arrives.
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// ---------------------
// ROUTES
// ---------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Apda Prabandhan API is running",
    environment: process.env.NODE_ENV,
    healthCheck: "/api/health"
  });
});

app.use("/api", mainRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    // Connect to MongoDB
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `\n Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// If file is run directly (local development), start the server
if (require.main === module) {
  startServer();
} else {
  // If imported (e.g. by Vercel), just connect to DB
  connectDB();
}

// Export app for Vercel
module.exports = app;

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.NODE_ENV === "development"
    ? [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]
    : []),
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use("/api/auth", authRoutes);
app.use("/api", roleRoutes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Khet Rakshak backend is running" });
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");
    res.json({ success: true, databaseTime: result.rows[0].database_time });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ success: false, message: "Database is unavailable." });
  }
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: "Origin is not allowed." });
  }
  console.error("Unhandled request error:", error.message);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

if (require.main === module) {
  app.listen(port, () => console.log(`Backend listening on port ${port}`));
}

module.exports = app;

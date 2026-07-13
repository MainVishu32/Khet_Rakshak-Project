require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://khet-rakshak-project.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Thunder Client, Postman and server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    const isExactAllowedOrigin = allowedOrigins.includes(origin);

    // Allow Vercel-generated deployment URLs
    const isVercelDeployment =
      origin.startsWith("https://khet-rakshak-project-") &&
      origin.endsWith(".vercel.app");

    if (isExactAllowedOrigin || isVercelDeployment) {
      return callback(null, true);
    }

    console.error("Blocked CORS origin:", origin);
    return callback(null, false);
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

// CORS must come before routes
app.use(cors(corsOptions));

// Body parsers must come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Khet Rakshak backend is running",
  });
});

// PostgreSQL health route
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.json({
      success: true,
      message: "Backend and PostgreSQL are connected",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database health error:", error);

    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
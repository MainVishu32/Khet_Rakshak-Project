require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allows Postman, browser address bar and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.urlencoded({ extended: true }));

// Routes must come after CORS
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Khet Rakshak backend is running",
  });
});

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
    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
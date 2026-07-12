const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

/*
POST /api/auth/register
Registers a new farmer.
*/
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      preferredLanguage,
      state,
      district,
      village,
    } = req.body;

    // Basic validation
    if (!fullName || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, mobile number and password are required.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 4 characters.",
      });
    }

    // Check whether the mobile number already exists
    const existingFarmer = await pool.query(
      `
      SELECT id
      FROM farmers
      WHERE mobile_number = $1
         OR ($2::VARCHAR IS NOT NULL AND email = $2)
      `,
      [mobileNumber, email || null]
    );

    if (existingFarmer.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "A farmer with this mobile number or email already exists.",
      });
    }

    // Never store the original password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO farmers (
        full_name,
        mobile_number,
        email,
        password_hash,
        preferred_language,
        state,
        district,
        village,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'farmer')
      RETURNING
        id,
        full_name,
        mobile_number,
        email,
        preferred_language,
        state,
        district,
        village,
        role,
        created_at
      `,
      [
        fullName.trim(),
        mobileNumber.trim(),
        email?.trim() || null,
        passwordHash,
        preferredLanguage || "English",
        state || null,
        district || null,
        village || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Farmer registered successfully.",
      farmer: result.rows[0],
    });
  } catch (error) {
    console.error("Farmer registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register farmer.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});
/*
POST /api/auth/login
Logs in a registered farmer.
*/
router.post("/login", async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and password are required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        mobile_number,
        email,
        password_hash,
        preferred_language,
        state,
        district,
        village,
        role
      FROM farmers
      WHERE mobile_number = $1
      `,
      [mobileNumber.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password.",
      });
    }

    const farmer = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      farmer.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password.",
      });
    }

    const token = jwt.sign(
      {
        farmerId: farmer.id,
        role: farmer.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      farmer: {
        id: farmer.id,
        fullName: farmer.full_name,
        mobileNumber: farmer.mobile_number,
        email: farmer.email,
        preferredLanguage: farmer.preferred_language,
        state: farmer.state,
        district: farmer.district,
        village: farmer.village,
        role: farmer.role,
      },
    });
  } catch (error) {
    console.error("Farmer login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
      error: error.message,
    });
  }
});

module.exports = router;
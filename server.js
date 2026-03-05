const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

/* ---------------- DATABASE ---------------- */

// Connect MongoDB Atlas
connectDB();

/* ---------------- MIDDLEWARE ---------------- */

// Allow frontend requests
app.use(cors({
  origin: "*"
}));

// Parse JSON
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static("public"));

/* ---------------- ROUTES ---------------- */

// API routes
app.use("/api", authRoutes);

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
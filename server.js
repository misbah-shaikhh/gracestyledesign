const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* ---------------- DATABASE ---------------- */

connectDB();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- STATIC FILES ---------------- */

// Public frontend
app.use(express.static(path.join(__dirname, "public")));

// Admin panel
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ---------------- API ROUTES ---------------- */

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
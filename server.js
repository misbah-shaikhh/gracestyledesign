const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const bcrypt = require("bcryptjs");

connectDB();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, contactNo, email, dob, gender, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { contactNo }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      contactNo,
      email,
      dob,
      gender,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


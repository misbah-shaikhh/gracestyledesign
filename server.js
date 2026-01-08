const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const User = require("./models/user");

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, contactNo, email, dob, gender } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { contactNo }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, contactNo, email, dob, gender });
    await user.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN (email only for now)
app.post("/login", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "Login successful", user });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

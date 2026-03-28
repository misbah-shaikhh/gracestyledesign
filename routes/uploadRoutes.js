const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// SINGLE IMAGE UPLOAD
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // delete local file after upload (important)
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Image uploaded",
      imageUrl: result.secure_url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
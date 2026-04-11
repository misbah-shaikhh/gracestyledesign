const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// MULTIPLE IMAGE UPLOAD (MAX 3)
router.post("/", upload.array("image", 3), async (req, res) => {
  try {

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      // delete local file
      fs.unlinkSync(file.path);

      imageUrls.push(result.secure_url);
    }

    res.status(200).json({
      message: "Images uploaded",
      imageUrls
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
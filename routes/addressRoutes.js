const express = require("express");
const router = express.Router();
const Address = require("../models/address");
const verifyToken = require("../middleware/authMiddleware");

/* GET USER ADDRESSES */

router.get("/", verifyToken, async (req, res) => {

    const addresses = await Address.find({ userId: req.user.id });

    res.json(addresses);

});


/* ADD ADDRESS */

router.post("/", verifyToken, async (req, res) => {

    const existing = await Address.find({ userId: req.user.id });

    const newAddress = new Address({
        userId: req.user.id,
        ...req.body,
        isDefault: existing.length === 0
    });

    await newAddress.save();

    res.json({ message: "Address added" });

});


/* SET DEFAULT ADDRESS */

router.put("/default/:id", verifyToken, async (req, res) => {

    await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
    );

    await Address.findByIdAndUpdate(req.params.id, {
        isDefault: true
    });

    res.json({ message: "Default address updated" });

});

/* UPDATE ADDRESS */
router.put("/:id", verifyToken, async (req, res) => {

    try {

        // 🔥 if user sets this as default → reset others
        if (req.body.isDefault) {
            await Address.updateMany(
                { userId: req.user.id },
                { isDefault: false }
            );
        }

        const updated = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { returnDocument: "after" }
        );

        res.json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update address" });
    }

});

module.exports = router;
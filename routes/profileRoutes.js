/* -------- GET USER PROFILE -------- */

router.get("/profile/:phone", async (req, res) => {

  try {

    const user = await User.findOne(
      { phone: req.params.phone },
      "phone email name birthday"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {

    console.error("Profile Fetch Error:", error);

    res.status(500).json({ message: "Server error" });

  }

});


/* -------- UPDATE BIRTHDAY -------- */

router.put("/profile", verifyToken, async (req, res) => {

  try {

    const { birthdate } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { birthdate: birthdate },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});
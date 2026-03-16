const express = require("express");
const { userAuth } = require("../middleware/userAuth");
const { User } = require("../models/User");

const router = express.Router();

router.get("/profile/view", userAuth, async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Error fetching user: " + error.message);
    throw new Error(error);
  }
});

router.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res.status(200).send([]);
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send("Error fetching feed: " + error.message);
    throw new Error(error);
  }
});

router.delete("/profile", async (req, res) => {
  const userId = req.body.userId;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).send(`User with ${userId} deleted successfully`);
  } catch (error) {
    res.status(500).send("Error deleting user: " + error.message);
    throw new Error(error);
  }
});

router.patch("/profile/edit", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "password",
    "age",
    "gender",
    "skills",
  ];

  if (!userId) {
    return res.status(400).send("User ID is required for update");
  }

  const updates = Object.keys(data).filter((update) => update !== "userId");
  const isValidOperation = updates.every((update) =>
    ALLOWED_UPDATES.includes(update)
  );

  if (!isValidOperation) {
    return res
      .status(400)
      .send("Invalid updates! Allowed fields: " + ALLOWED_UPDATES.join(", "));
  }

  try {
    const user = await User.findOne({ emailId: userId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    updates.forEach((update) => {
      user[update] = data[update];
    });

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Error updating user: " + error.message);
    throw new Error(error);
  }
});

module.exports = { router };

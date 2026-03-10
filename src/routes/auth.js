const express = require("express");
const { collectValidationErrors } = require("../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  // Handle user signup logic here
  if (!req.body) {
    res.status(400).send("Request body is missing");
  }

  const userData = req.body;

  const user = new User(userData);

  try {
    const savingUser = await User.findOne({ emailId: userData.emailId });
    if (savingUser) {
      return res.status(400).send("User with this email already exists");
    }

    // store hash password
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.log(Object.keys(error));
    const errors = collectValidationErrors(error);
    res.status(400).send({ errors, message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    // Validate user
    const isValidUser = await bcrypt.compare(password, user.password);

    // Assign cookie
    if (isValidUser) {
      const cookie = jwt.sign({ emailId }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.cookie("token", cookie);
      res.status(200).send("user logged in successfully!!");
    }
  } catch (err) {
    res.status(400).send("Bad request");
  }
});

module.exports = { router };

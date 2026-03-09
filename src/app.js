const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/userAuth");
const { connectDB } = require("./db/connectDB");
const { User } = require("./models/User");
const { collectValidationErrors } = require("./utils");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error(
      "Failed to connect to the database. Server not started. \nError: ",
      error
    );
  });

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
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

app.get("/feed", async (req, res) => {
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

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).send(`User with ${userId} deleted successfully`);
  } catch (error) {
    res.status(500).send("Error deleting user: " + error.message);
    throw new Error(error);
  }
});

app.patch("/user", async (req, res) => {
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

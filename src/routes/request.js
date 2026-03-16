const express = require("express");
const { userAuth } = require("../middleware/userAuth");
const jwt = require("jsonwebtoken");
const { Connection } = require("mongoose");

const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: Invalid token");
    }

    const { status, toUserId } = req.params;
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const fromUserEmail = decodedToken.emailId;
    const fromUser = await User.findOne({ emailId: fromUserEmail });

    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .send(
          "Invalid status. Allowed values are: " + allowedStatuses.join(", ")
        );
    }

    const existingRequest = await connectionRequest.findOne({
      $or: [
        { fromUserId: fromUser._id, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUser._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).send("Connection request already exists");
    }

    if (!fromUser) {
      res.status(404).send("Invalid user");
    }

    const connectionRequest = new connectionRequest({
      fromUserId: fromUser._id,
      toUserId: toUserId,
      status: status,
    });

    const data = await connectionRequest.save();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Error processing request: " + error.message);
    throw new Error(error);
  }
});

router.post("/review/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: Invalid token");
    }

    const { status, toUserId } = req.params;
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const fromUserEmail = decodedToken.emailId;
    const fromUser = await User.findOne({ emailId: fromUserEmail });

    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .send(
          "Invalid status. Allowed values are: " + allowedStatuses.join(", ")
        );
    }

    const connectionRequest = await connectionRequest.findOne({
      fromUserId: toUserId,
      toUserId: fromUser._id,
    });

    if (!connectionRequest) {
      return res.status(404).send("Connection request not found");
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

module.exports = { router };

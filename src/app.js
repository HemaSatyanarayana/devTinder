const express = require("express");
const app = express();
const { connectDB } = require("./db/connectDB");
const cookieParser = require("cookie-parser");

const { router: authRoutes } = require("./routes/auth");
const { router: profileRoutes } = require("./routes/profile");
const { router: requestRoutes } = require("./routes/request");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", requestRoutes);

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

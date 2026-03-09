const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 3;
        },
        message: "First name must be at least 3 characters long",
      },
    },

    lastName: {
      type: String,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email format",
      },
    },

    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 6;
        },
        message: "Password must be at least 6 characters long",
      },
    },

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
    },

    photoUrl: {
      type: String,
      default: "https://example.com/default-profile.png",
      validate: {
        validator: function (value) {
          return validator.isURL(value);
        },
        message: "Invalid URL format",
      },
    },

    about: {
      type: String,
      default: "This user prefers to keep an air of mystery about them.",
      validate: {
        validator: function (value) {
          return value.length <= 500;
        },
        message: "About section cannot exceed 500 characters",
      },
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    skills: {
      type: [String],
      max: [5, "You can specify up to 5 skills"],
      validate: {
        validator: function (value) {
          return value.every((skill) => skill.length >= 2);
        },
        message: "Each skill must be at least 2 characters long",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };

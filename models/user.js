const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Firstname: { type: String, required: true },
  Lastname: { type: String, required: true },
  MobileNumber: { type: String, required: true },
  EmailVerification: { type: Boolean, default: false },
  resetLink: { type: String, default: "" },
});

module.exports = mongoose.model("posts", userModel);

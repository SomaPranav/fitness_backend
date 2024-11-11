const mongoose = require("mongoose");

const fitnessSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String },
    password: { type: String },
    gender: { type: String },
    date: { type: Date },
    height: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },
  },
  {
    collection: "Signup",
  }
);

module.exports = mongoose.model("Signup", fitnessSchema);

const mongoose = require("mongoose");

const History = new mongoose.Schema(
  {
    username: { type: String },
    workoutType: { type: String },
    selectedWorkoutType: { type: String },
    date: { type: Date },
    fromTime: { type: String },
    toTime: { type: String },
    calories: { type: Number },
    totalCalories: { type: Number },
  },
  {
    collection: "History",
  }
);

module.exports = mongoose.model("History", History);

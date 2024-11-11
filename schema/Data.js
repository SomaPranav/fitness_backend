const mongoose = require("mongoose");

const Data = new mongoose.Schema(
  {
    username: { type: String },
    workoutType: { type: String },
    selectedWorkoutType: { type: String },
    date: { type: Date },
    fromTime: { type: String },
    toTime: { type: String },
  },
  {
    collection: "Data",
  }
);

module.exports = mongoose.model("Data", Data);

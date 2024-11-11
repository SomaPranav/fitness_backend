const express = require("express");
const router = express.Router();
const History = require("../schema/History");
const Data = require("../schema/Data");

router.post("/create", async (req, res, next) => {
  const {
    username,
    workoutType,
    selectedWorkoutType,
    date,
    fromTime,
    toTime,
    calories,
    totalCalories,
  } = req.body;

  try {
    const newUser = await History.create({
      username,
      workoutType,
      selectedWorkoutType,
      date,
      fromTime,
      toTime,
      calories,
      totalCalories,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/totalCalories", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Username parameter is missing" });
  }

  try {
    const userHistory = await History.find({ username: username });

    // Calculate the total calories from userHistory
    let totalCalories = 0;
    for (const entry of userHistory) {
      // Assuming there's a 'calories' field in each entry
      totalCalories += entry.calories;
    }

    res.status(200).json({ totalCalories }); // Sending totalCalories as JSON response
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.get("/", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Username parameter is missing" });
  }

  try {
    const filteredData = await History.find({ username: username });

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.delete("/deleteTasks1", async (req, res, next) => {
  const { username } = req.body;

  try {
    const deletedTask = await History.deleteMany({
      username: username,
    });

    if (deletedTask) {
      return res.json("Tasks deleted successfully");
    } else {
      return res.status(404).json("Task not found");
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;

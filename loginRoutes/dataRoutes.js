const express = require("express");
const router = express.Router();
const Data = require("../schema/Data");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

router.post("/createTask", async (req, res, next) => {
  const { username, workoutType, selectedWorkoutType, date, fromTime, toTime } =
    req.body;

  try {
    const currentDate = new Date();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes(); // Convert to minutes

    const selectedDate = new Date(date);
    const selectedTime = selectedDate.getTime(); // Convert to milliseconds

    // if (selectedTime <= currentDate.getTime() || fromTime < currentTime) {
    //   return res
    //     .status(400)
    //     .json("Invalid date and time. Please choose a future date and time.");
    // }

    const existingTask = await Data.findOne({
      selectedWorkoutType: selectedWorkoutType,
      username: username,
    });
    const timeFrom = await Data.findOne({
      fromTime: fromTime,
      username: username,
    });

    if (existingTask && timeFrom) {
      if (
        existingTask.username === username &&
        timeFrom.username === username
      ) {
        return res
          .status(400)
          .json(
            "Tasks already exist for the same username. Delete to add again."
          );
      }
    }

    const newUser = await Data.create({
      username,
      workoutType,
      selectedWorkoutType,
      date,
      fromTime,
      toTime,
    });

    return res.json("Task added successfully");
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Username parameter is missing" });
  }

  try {
    const filteredData = await Data.find({ username: username });

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.delete("/deleteTask", async (req, res, next) => {
  const { username, selectedWorkoutType } = req.body;

  try {
    const deletedTask = await Data.findOneAndDelete({
      username: username,
      selectedWorkoutType: selectedWorkoutType,
    });

    if (deletedTask) {
      return res.json("Task deleted successfully");
    } else {
      return res.status(404).json("Task not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/apichatbot", async (req, res) => {
  const userMessage = req.body.message;

  // Modify the message to ensure fitness-related context is maintained
  const fitnessMessage = `This is a fitness-related question: ${userMessage}`;

  try {
    // Post to Grok API with the adjusted fitness message
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", // Use the appropriate model as per Grok documentation
        messages: [
          { role: "user", content: fitnessMessage }, // Prepend the message with fitness context
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`, // Ensure API key is in your environment variables
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the bot's message, handling any response structure issues
    const botMessage =
      response.data.choices?.[0]?.message?.content || "No reply from the bot.";

    // Return the bot's response back to the client
    res.json({ botMessage });
  } catch (error) {
    // Handle any errors that occur
    if (error.response) {
      console.error(
        "Grok API Error:",
        error.response.status,
        error.response.data
      );
      res.status(500).json({
        error: `Grok API Error: ${
          error.response.data.error?.message || "Unknown error."
        }`,
      });
    } else {
      console.error("Unknown error:", error.message);
      res.status(500).json({ error: "Something went wrong!" });
    }
  }
});

router.delete("/deleteTasks", async (req, res, next) => {
  const { username } = req.body;

  try {
    const deletedTask = await Data.deleteMany({
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

router.post("/updateTask", async (req, res, next) => {
  const { _id, workoutType, selectedWorkoutType, date, fromTime, toTime } =
    req.body;

  try {
    const existingUser = await Data.findOne({
      _id: _id,
    });

    if (existingUser) {
      existingUser.workoutType = workoutType;
      existingUser.selectedWorkoutType = selectedWorkoutType;
      existingUser.date = date;
      existingUser.fromTime = fromTime;
      existingUser.toTime = toTime;
      await existingUser.save(); // Save the updated document
      res.status(200).json({ message: "User data updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

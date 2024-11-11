const express = require("express");
const router = express.Router();
const loginSchema = require("../schema/fitnessSchema");
const bodyParser = require("body-parser");

router.post("/create-fitness", async (req, res, next) => {
  const {
    name,
    username,
    email,
    password,
    password1,
    gender,
    date,
    height,
    weight,
    bmi,
  } = req.body;

  // Check if a user with the same username already exists
  const existingUser = await loginSchema.findOne({ username: username });
  const existingEmail = await loginSchema.findOne({ email: email });

  if (existingUser) {
    return res
      .status(400)
      .json("Username already exists. Please choose a different username.");
  }
  if (existingEmail) {
    return res
      .status(400)
      .json("Email already exists. Please choose a different email.");
  }

  if (password === password1) {
    try {
      // Create a new user record
      const newUser = await loginSchema.create({
        name,
        username,
        email,
        password,
        gender,
        date,
        height,
        weight,
        bmi,
      });
      return res.json("User added successfully");
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  } else {
    console.log("Passwords do not match.");
    res.status(400).json("Passwords not matched");
  }
});

router.get("/", (req, res, next) => {
  loginSchema
    .find()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      return next(err);
    });
});

router.post("/forgot-password", (req, res) => {
  const { name, username, password } = req.body;
  loginSchema
    .findOne({ username: username })
    .then((login) => {
      if (login) {
        if (login.name == name) {
          login.password = password;
          login
            .save()
            .then(() => {
              res.json("Password Updated");
            })
            .catch((err) => {
              console.error(err);
              res.json("Error updating password");
            });
        } else {
          res.json("Credentials incorrect");
        }
      } else {
        res.json("No record exists");
      }
    })
    .catch((err) => {
      console.error(err);
      res.json("Error finding user");
    });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  loginSchema.findOne({ username: username }).then((login) => {
    if (login) {
      if (login.password === password) {
        return res.status(200).json("login successfull");
      } else {
        return res.status(400).json("Password incorrect");
      }
    } else {
      return res.status(400).json("No record exits");
    }
  });
});

router.post("/homepage", (req, res) => {
  const { username } = req.body;
  loginSchema.findOne({ username: username }).then((login) => {
    if (login) {
      return res.json(login);
    } else {
      return res.status(400).json("No record exits");
    }
  });
});

router.post("/profile", (req, res) => {
  const { username } = req.body;
  loginSchema.findOne({ username: username }).then((login) => {
    if (login) {
      return res.json(login);
    }
  });
});

router.post("/update", async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password,
      gender,
      date,
      height,
      weight,
      bmi,
    } = req.body;

    // Check if a user with the provided username exists in the database
    const existingUser = await loginSchema.findOne({ username });

    if (existingUser) {
      // Update the existing user's information
      existingUser.name = name;
      existingUser.email = email;
      existingUser.password = password;
      existingUser.gender = gender;
      existingUser.date = date;
      existingUser.height = height;
      existingUser.weight = weight;
      existingUser.bmi = bmi;
      await existingUser.save();

      res.status(200).json({ message: "User data updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Failed to save/update user data" });
  }
});

router.delete("/update/:username", async (req, res) => {
  try {
    const usernameToDelete = req.params.username;

    // Find the user with the provided username and delete it
    const deletedUser = await loginSchema.findOneAndDelete({
      username: usernameToDelete,
    });

    if (deletedUser) {
      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;

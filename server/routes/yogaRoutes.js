const express = require("express");
const YogaPose = require("../models/YogaPose.js");

const router = express.Router();

router.get("/poses", async (req, res) => {
  try {
    const { name, level } = req.query;

    // Construct the query object
    const query = {};

    // Add the name query if provided
    if (name) {
      query.AName = { $regex: new RegExp(name, "i") }; // Case-insensitive search
    }

    // Add the level query if provided
    if (level) {
      query.Level = { $regex: new RegExp(level, "i") }; // Case-insensitive search
    }

    // Find poses that match the query
    const poses = await YogaPose.find(query);
    
    // If no poses are found, return a 404 status code
    if (poses.length === 0) {
      return res.status(404).json({ message: "Poses not found" });
    }
    
    // Return the poses in the response
    res.json(poses);
  } catch (err) {
    // If an error occurs, return a 500 status code
    res.status(500).json({ message: err.message });
  }
});

router.get("/poses/:id", async (req, res) => {
  try {
    const pose = await YogaPose.findById(req.params.id);
    if (!pose) {
      return res.status(404).send({ message: "Pose not found" });
    }
    res.json(pose);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

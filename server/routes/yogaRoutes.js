const express = require("express");
const YogaPose = require("../models/YogaPose.js");

const router = express.Router();

router.get("/poses", async (req, res) => {
  try {
    const { level } = req.query;
    let query = {};
    if (level) {
      query.Level = { $regex: new RegExp(level, "i") };
    }

    const poses = await YogaPose.find(query);
    res.json(poses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();
const Feedback = require('../models/feedbackModel.js');

// Endpoint to get health plan recommendations
router.post('/recommend', async (req, res) => {
    try {
        // Forward the request to the Flask API
        const response = await axios.post(
            'http://localhost:5000/health/recommend', // Flask API URL
            req.body // Forward the request body
        );

        // Send the response from Flask back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error in healthRoutes:', error);
        res.status(500).json({ message: 'Error fetching health plan recommendations' });
    }
});

// POST /api/health/feedback - Submit feedback for a health plan
router.post('/feedback', async (req, res) => {
  const { userId, healthPlanId, feedback } = req.body;
  
    try {
    console.log(req.body);
    // const { userId, healthPlanId, feedback } = req.body;

    const newFeedback = new Feedback({
      userId,
      healthPlanId,
      feedback
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting feedback');
  }
});

module.exports = router;

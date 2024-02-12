const express = require('express');
const axios = require('axios');
const router = express.Router();

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

module.exports = router;

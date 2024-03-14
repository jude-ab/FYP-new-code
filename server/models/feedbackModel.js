const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  healthPlanId: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true,
    enum: ['like', 'dislike']
  }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
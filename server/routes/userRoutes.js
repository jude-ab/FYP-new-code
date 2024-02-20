const express = require("express");
const {
  authUser,
  registerUser,
  getUsers,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authenticationMiddleware.js");
const User = require("../models/userModel.js");

const router = express.Router();

router.route("/").post(registerUser).get(protect, getUsers); // get all users
router.post("/login", authUser);
router.post('/moods', protect, async (req, res) => {
  const { userId, mood } = req.body;
  console.log(`Updating moods for user ID: ${userId} with mood: ${mood}`);

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $push: { moods: { mood: mood } }
    }, { new: true });

    console.log('Updated user:', updatedUser);

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json(updatedUser.moods);
  } catch (error) {
    console.error('Error updating moods:', error);
    res.status(500).send({ message: error.message });
  }
});

router.get('/:userId/moods', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('moods');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.moods);
  } catch (error) {
    console.error('Error fetching user moods:', error);
    res.status(500).json({ message: 'Error fetching user moods' });
  }
});

// Endpoint to delete a mood by its ID
router.delete('/moods/:moodId', protect, async (req, res) => {
  try {
    const { moodId } = req.params;
    const userId = req.user._id;

    if (!moodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: "Invalid mood ID format" });
    }

    // Fetch the user to check if the mood actually exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Remove the mood using the pull method
    const moodExists = user.moods.some(mood => mood._id.equals(moodId));
    if (!moodExists) {
      return res.status(404).send({ message: "Mood not found" });
    }

    user.moods.pull({ _id: moodId });
    await user.save(); // Save the user document after removing the mood
    res.status(200).json(user.moods);
  } catch (error) {
    console.error('Error deleting mood:', error);
    res.status(500).send({ message: 'Error deleting mood', error: error.toString() });
  }
});





// Fetch user profile information
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Assuming `req.user` is set by your `protect` middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile information
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ message: 'Error updating user profile', error: error.message });
  }
});

module.exports = router;

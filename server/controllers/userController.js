const asynchHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const generateToken = require("../config/generateToken.js");

const registerUser = asynchHandler(async (req, res) => {
  const { username, email, password, profilePic } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    profilePic,
  });

  //after creating user, send back user info and create jwt token
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid User");
  }
});

const authUser = asynchHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (username && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

// get all users
//using mongoose find() method to get all users
const getUsers = asynchHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        //if there is a search query, use it to filter users
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {}; //otherwise, return all users
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); //exclude current user from list of users
  res.send(users);
});

module.exports = { registerUser, authUser, getUsers };
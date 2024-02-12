const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel.js");
const User = require("../models/userModel.js");
const Message = require("../models/messageModel.js");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // get user id from request body

  if (!userId) {
    // check if user id exists
    res.status(400);
    throw new Error("Please provide a user id");
  }

  //if chat exists with user id, return chat id
  //if chat does not exist with user id, create chat with user id
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } }, // check if user is in chat
      { users: { $elemMatch: { $eq: userId } } }, // check if user is in chat
    ],
  })
    .populate("users", "-password")
    .populate("recentMessages"); //populate users field with user data

  isChat = await User.populate(isChat, {
    path: "recentMessages.sender",
    select: "username profilePic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    }; //create chat data

    //create chat
    try {
      const createdChat = await Chat.create(chatData);

      //populate users field with user data
      const FullChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChat = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("recentMessages")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "recentMessages.sender",
          select: "username profilePic email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400);
    throw new Error("Please provide users and chat name");
  }

  var users = JSON.parse(req.body.users); //parse users from string to array

  if (users.length < 2) {
    res.status(400);
    throw new Error("Please provide more users");
  }

  users.push(req.user); //add current user to users array

  try {
    const groupchat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    }); //create group chat

    const fullGroupChat = await Chat.findOne({
      _id: groupchat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true } //return the updated document
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.json(updatedChat);
  }
});

const addUser = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const addedUser = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true } //return the updated document
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addedUser) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.json(addedUser);
  }
});

const removeUser = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if chat exists before attempting to update
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Proceed with removal
  const removedUser = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(removedUser);
});


module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameChat,
  addUser,
  removeUser,
};

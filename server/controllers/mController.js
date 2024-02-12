const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel.js");
const User = require("../models/userModel.js");
const Chat = require("../models/chatModel.js");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("No message or chat id provided");
    return res.status(400).send();
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "username profilePic"); //populate the instance of the mongoose class with the sender's username and profile pic
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username profilePic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      recentMessages: message,
    });

    res.json(message);
  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
});

const MessagesA = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username profilePic")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
});
module.exports = { sendMessage, MessagesA };

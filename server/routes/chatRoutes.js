const express = require("express");
const { protect } = require("../middleware/authenticationMiddleware.js");
const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameChat,
  addUser,
  removeUser,
} = require("../controllers/chatController.js");

const router = express.Router();

router.route("/").post(protect, accessChat); //accessing or creating the chat
router.route("/").get(protect, fetchChat); //get chats from the database for the user
router.route("/groupchat").post(protect, createGroupChat); //create a group chat
router.route("/renamechat").put(protect, renameChat); //rename a chat
router.route("/removeuser").put(protect, removeUser); //remove a user from a chat
router.route("/adduser").put(protect, addUser); //add a user to a chat

module.exports = router;

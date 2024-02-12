const express = require("express");
const { protect } = require("../middleware/authenticationMiddleware.js");
const { sendMessage } = require("../controllers/mController.js");
const { MessagesA } = require("../controllers/mController.js");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, MessagesA);

module.exports = router;

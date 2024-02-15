const mongoose = require("mongoose");
const { Schema } = mongoose;

const yogaPoseSchema = new Schema({
  AName: String,
  Level: String,
  Description: String,
});

const YogaPose = mongoose.model("YogaPose", yogaPoseSchema);
module.exports = YogaPose;

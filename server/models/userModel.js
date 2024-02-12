const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const moodEntrySchema = new mongoose.Schema({
  mood: { type: String, required: true, enum: ['happy', 'sad', 'anxious', 'frustrated'] },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 20,
      unique: true,
    },
    moods: [moodEntrySchema],
    email: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    dob: {
      type: Date,  
    },
    about: {
      type: String,
    },
    profilePic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

//check if entered password matches hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compareSync(enteredPassword, this.password);
};

//before saving user, hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10); //default is 10
  this.password = await bcrypt.hashSync(this.password, salt); //hash password
});

const User = mongoose.model("User", userSchema);
module.exports = User;

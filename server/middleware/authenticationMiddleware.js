const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asynchHandler = require("express-async-handler");

// create jwt token for user upon registration or login
const protect = asynchHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization && // check if authorization header exists
    req.headers.authorization.startsWith("Bearer") // check if authorization header starts with "Bearer"
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // split token from "Bearer" and get token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // decode token
      // console.log(decoded);
      req.user = await User.findById(decoded.id).select("-password"); // get user info from decoded token and exclude password
      // console.log(req.user);
      next(); // move on to next middleware
    } catch (error) {
      console.error(error);
      console.log("User ID from protect middleware:", req.user._id);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };

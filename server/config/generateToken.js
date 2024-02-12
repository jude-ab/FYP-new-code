const jwt = require("jsonwebtoken");

//generate token for user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    //process.env.JWT_SECRET is the secret key that we will use to encrypt the token
    expiresIn: "300d",
  });
};

module.exports = generateToken;

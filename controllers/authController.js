const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const bcrypt = require("bcrypt");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true;

  user.password = undefined;

  res.cookie("jwt", token, cookieOption);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      name: user.name,
      email: user.email,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  let newUser = { ...req.body };
  newUser.password = await bcrypt.hash(this.password, 12);
  console.log(newUser.password);
  const newUserID = await User.add(req.body);
  newUser.id = newUserID.id;
  createSendToken(newUser, 201, res);
});

const Token = require("../models/tokenModel");
const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// const

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up 6 ");
  }

  // cheack email

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has alraedy been registered ");
  }

  // create new user

  const user = await User.create({
    name,
    email,
    password,
    bio,
  });

  //generate Token
  const token = generateToken(user._id);

  //  send HTTP only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email or password");
  }

  // check if user exists

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error(" User not found , Please sign up ");
  }

  // user Exists,  check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //generate Token
  const token = generateToken(user._id);

  //  send HTTP only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

//Logout user
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: " Successfully logout" });
});

// Get user Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("user not found ");
  }
});

// get login status

const loginStatus = asyncHandler(async (req, res) => {
  const token = await req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  //verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    return res.json(true);
  }
  return res.json(false);
  // res.send("login status")
});

//update user

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// changepassword

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found , please signup");
  }
  // validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add and new password");
  }
  // check if old password is correct or matches

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // save new password

  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("password change successsful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  // res.send("ForgetPassword")
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User dose not exit");
  }

  //Delete Token
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }
  // creating ratio
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  //    console.log(resetToken);
  //    res.send(resetToken+"Forgot Password");

  // hash token before saving to DB

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // save token to DB

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();

  // contsruct reset  url
  // console.log(hashedToken);
  // res.send("forgot password")

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email

  const message = `<h2> helo ${user.name}</h2>
<p>Please use the url below to reset your password </p>
<p>this reset link is valid for only 30 minutes</p>

<a href=${resetUrl} clicktracking = off>${resetUrl}></a>

<p>Regards.....</p>
<p>evently team </p>
`;

  const subject = "password reset Request";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, sent_to, sent_from);
    res.status(200).json({ suucess: true, message: "reset email send" });
  } catch (error) {
    res.status(500);
    throw new Error("email not send try again");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
};

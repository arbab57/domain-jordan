const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_TOKEN } = require("../config/crypto");
const { clearCache, deleteKeys } = require("../utils/redisUtils");
const { OAuth2Client } = require("google-auth-library");
const { sendOtpEmail } = require("../config/nodemailer");
const client = new OAuth2Client(process.env.clientId);

exports.register = async (req, res) => {
  const { name, email, number, address, password } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required!" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required!" });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Email is Taken!" });
    }
    const hasdedPAss = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      number,
      password: hasdedPAss,
      address,
    });
    const savedUser = await newUser.save();
    deleteKeys("/recents/users*");
    deleteKeys("/recents*");
    deleteKeys("/users*");

    const info = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Registration</title>
</head>
<body>
    <h1>New User Registered!</h1>
    <p>Hello Admin,</p>
    <p>A new user has signed up on your platform.</p>
    <p><strong>User Details:</strong></p>
    <ul>
        <li><strong>Name:</strong> ${savedUser.name}</li>
        <li><strong>Email:</strong> ${savedUser.email}</li>
        <li><strong>Registration Date:</strong> ${savedUser.createdAt}</li>
    </ul>
    <p>Please log in to the admin panel to view and manage the user.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>`;
    sendOtpEmail(process.env.ADMIN_EMAIL, info, "New user");

    res.status(200).json({ message: " user cretaed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        message: "Invalid email",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password is wrong" });
    let payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_TOKEN);
    res.cookie("userToken", token, {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      // maxAge: 60 * 60 * 1000,
      secure: true,
    });
    res.status(200).json({
      message: "User successfully logged in",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: err,
    });
  }
};

exports.googleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.clientId,
    });

    const payload = ticket.getPayload();
    const userid = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];

    let user = await User.findOne({ email: email });

    if (!user) {
      const hashedPass = await bcrypt.hash(userid, 10);
      user = new User({
        email: email,
        name: name,
        password: hashedPass,
      });
      await user.save();

      const userToFind = await User.findOne({ email: email });
      let payload1 = { id: userToFind._id };
      const token = jwt.sign(payload1, SECRET_TOKEN);
      res.cookie("token", token, {
        httpOnly: true,
        // maxAge: 60 * 60 * 1000
      });
      res.status(200).send({
        message: "User successfully logged in",
      });
      return;
    }
    let payload1 = { id: user._id };
    const token = jwt.sign(payload1, SECRET_TOKEN);
    res.cookie("token", token, {
      httpOnly: true,
      // maxAge: 60 * 60 * 1000
    });
    res.status(200).send({
      message: "User successfully logged in",
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.facebookAuth = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: err,
    });
  }
};

exports.SignOut = async (req, res) => {
  try {
    const cookie = req.cookies.userToken;
    if (!cookie) {
      return res.status(401).json({ message: "No token provided" });
    }
    jwt.verify(cookie, SECRET_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      // Clear the token cookie
      res.clearCookie("userToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
      return res.status(200).json({ message: "User Sign out successfully" });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.id;
    const delUser = await User.deleteOne({ _id: userId });
    if (!delUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User deleted successfully!",
    });
    deleteKeys("/recents/users*");
    deleteKeys("/recents*");
    deleteKeys("/users*");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userID = req.id;

    // To find the user
    const fetchUser = await User.findById(userID);

    // Comparing passwords
    const isMatch = await bcrypt.compare(oldPassword, fetchUser.password);
    if (!isMatch) {
      return res.status(404).json({
        message: "Wrong Password!",
      });
    }

    // Saving new password after hashing
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    fetchUser.password = hashedPassword;
    await fetchUser.save();

    res.status(200).json({
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.log("The error is", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.check = async (req, res) => {
  res.status(200).json({ message: "Authorized" });
};

exports.userData = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      res.status(406).json({
        message: "No data Found for user!",
      });
    }
    const userData = await User.findOne({ _id: userId });
    // console.log("User data is", userData)
    res.status(200).json({
      name: userData.name,
      email: userData.email,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.changeDetails = async (req, res) => {
  try {
    const userId = req.id;
    const { name, email, number, address, password = "" } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password does not match!" });
    }
    const emailInUse = await User.findOne({ email: email });
    // if(emailInUse) return res.status(400).json({message: "Email already in use"})
    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.address = address || user.address;
    const changedUser = await user.save();
    deleteKeys(`/details/${userId}*`);
    deleteKeys("/recents/users*");
    res.status(200).json({ message: "User details changed successfully!" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

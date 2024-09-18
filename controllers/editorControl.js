const Editor = require("../models/editorSchema")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_TOKEN } = require("../config/crypto");

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const editor = await Editor.findOne({ email: email });
    if (!editor) return res.status(404).json({ message: "editor not found!" });
    const IsMatch = await bcrypt.compare(password, editor.password);
    if (!IsMatch) return res.status(401).json({ message: "Wrong password!" });
    let payload = { id: editor._id };
    const token = jwt.sign(payload, SECRET_TOKEN);
    res.cookie("editorToken", token, {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      // maxAge: 60 * 60 * 1000,
      secure: true,
    });
    res.status(200).send({
      message: "editor successfully logged in",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.SignOut = async (req, res) => {
  try {
    const cookie = req.cookies.editorToken;
    if (!cookie) {
      return res.status(401).json({ message: "No token provided" });
    }
    jwt.verify(cookie, SECRET_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      // Clear the token cookie
      res.clearCookie("editorToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
      return res.status(200).json({ message: "editor Sign out successfully" });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
  
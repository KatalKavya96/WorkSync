const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const prisma = require("../prisma/prisma");
const {verifyEmail} = require('../utils/utils');

const handleLogin = async (req, res) => {
  const {email, password} = req.body;
  if(!email || !password) {
    return res.status(400).json({"error": "All fields are required!"});
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if(!user) {
      return res.status(400).json({"error": "Email is not registered"});
    }

    if(!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({"error": "Invalid password"})
    }

    const token = jwt.sign({
      name: user.name,
      email: user.email
    }, process.env.JWT_SECRET, {expiresIn: "24h"});
    const refreshToken = jwt.sign({
      name: user.name,
      email: user.email
    }, process.env.JWT_SECRET, {expiresIn: "30d"});

    return res.status(200).json({
      "message": "Logged in successfully",
      token,
      refreshToken
    })
  } catch(err) {
    console.log(err);
    return res.status(500).json({"error": "Internal Server Error"});
  }
}

const handleSignup = async (req, res) => {
  const {name, email, password} = req.body;
  if(!name || !email || !password) {
    return res.status(400).json({"error": "All fields are required!"});
  }
  if(!verifyEmail(email)) {
    return res.status(400).json({"error": "Invalid email"});
  }
  if(password.length<8) {
    return res.status(400).json({"error": "Password should have atleast 8 characters"});
  }

  try {
    const already = await prisma.user.findUnique({
      where: {email}
    });
    if(already) {
      return res.status(400).json({"error": "Email is already registered"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return res.status(201).json({
      "message": "User created successfully"
    })
  } catch(err) {
    console.log(err);
    return res.status(500).json({"error": "Internal Server Error"})
  }
}

const handleRefresh = async (req, res) => {
  const {refreshToken} = req.body;
  if(!refreshToken) {
    return res.status(400).json({"error": "Refresh token not found"});
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newToken = jwt.sign({name: decoded.name, email: decoded.email}, process.env.JWT_SECRET, {expiresIn: "24h"});
    const newRefreshToken = jwt.sign({name: decoded.name, email: decoded.email}, process.env.JWT_SECRET, {expiresIn: "30d"});

    return res.status(200).json({
      "message": "New token generated",
      token: newToken,
      refreshToken: newRefreshToken
    })
  } catch (err) {
    console.log(err);
    return res.status(400).json({"error": "Invalid refresh token"});
  }
}

module.exports = {
  handleLogin,
  handleSignup,
  handleRefresh
}
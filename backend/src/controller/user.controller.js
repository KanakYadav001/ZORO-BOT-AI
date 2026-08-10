const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {RegisterUserEmail  , LoginUserEmail}= require("../borker/listener");
const { sendEmail } = require("../service/mail.service");

async function register(req, res) {
  try {
    const { name = {}, email, password } = req.body;
    const { firstName, lastName } = name;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const IsuserExits = await userModel.findOne({ email });

    if (IsuserExits) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name: {
        firstName,
        lastName,
      },
      email,
      password: hashedPassword,
    });

 

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });



   RegisterUserEmail({ email, FullName: { firstName, lastName } });

    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const isUserExits = await userModel.findOne({ email });

    if (!isUserExits) {
      return res.status(400).json({ message: "email not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      isUserExits.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    

    const token = jwt.sign(
      { id: isUserExits._id, role: isUserExits.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    LoginUserEmail({ email });

    res.status(200).json({ message: "User login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  login,
  register,
  logout,
  getProfile,
};

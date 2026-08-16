const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { RegisterUserEmail, LoginUserEmail } = require("../borker/listener");
const { sendEmail } = require("../service/mail.service");

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  try {
    const { name = {}, email, password } = req.body;
    const { firstName, lastName } = name;

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    // 1. Check missing required fields
    if (!trimmedFirstName || !trimmedLastName || !cleanEmail || !password) {
      return res.status(400).json({
        message: "First name, last name, email, and password are required.",
      });
    }

    // 2. Validate email format
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // 3. Validate password strength / length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    // 4. Check if user already exists
    const existingUser = await userModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    // 5. Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      },
      email: cleanEmail,
      password: hashedPassword,
    });

    // 6. Sign JWT token
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

    // 7. Non-blocking background email dispatch (will not fail registration if mail service drops)
    RegisterUserEmail({
      email: cleanEmail,
      FullName: { firstName: trimmedFirstName, lastName: trimmedLastName },
    }).catch((emailErr) => {
      console.error("Non-blocking registration email failed:", emailErr?.message || emailErr);
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Handle Mongo duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed due to an internal error. Please try again.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    // 1. Check missing input
    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 2. Validate email format
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // 3. User lookup
    const user = await userModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // 5. Sign JWT token
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

    // 6. Non-blocking login security notification email
    LoginUserEmail({ email: cleanEmail }).catch((emailErr) => {
      console.error("Non-blocking login email failed:", emailErr?.message || emailErr);
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: "User login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      message: "Login failed due to an internal error. Please try again.",
    });
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

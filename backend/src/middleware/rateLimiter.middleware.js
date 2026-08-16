const rateLimit = require("express-rate-limit");

const ratelimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true, 
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

module.exports = ratelimit;
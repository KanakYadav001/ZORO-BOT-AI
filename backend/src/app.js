const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routers/user.router");
const chatRouter = require("./routers/chat.router");
const ratelimit = require("./middleware/rateLimiter.middleware");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(ratelimit);



app.get("/api", (req, res) => {
  res.send("Welcome to Zoro-AI Backend");
});

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

module.exports = app;

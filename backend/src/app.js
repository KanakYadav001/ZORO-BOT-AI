const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./routers/user.router');
const chatRouter = require('./routers/chat.router');
const { connect } = require('./borker/borker');
const listener = require('./borker/listener');

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connect().then(() => {
    listener();
})


app.use("/api/auth",authRouter);
app.use("/api/chat",chatRouter);




module.exports = app;
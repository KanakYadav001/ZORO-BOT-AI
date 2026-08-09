require('dotenv').config();
const app = require('./src/app');
const setupSocketServer = require('./src/socket/socket.server');
const {connect} = require('./src/borker/borker');
const connectDB = require('./src/db/db');
const listener = require('./src/borker/listener');
const http = require('http');

const server = http.createServer(app);
setupSocketServer(server);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    await connect();
    await listener();
    console.log("RabbitMQ queue listener initialized");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });


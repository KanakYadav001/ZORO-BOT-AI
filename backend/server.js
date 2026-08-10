require('dotenv').config();
const app = require('./src/app');
const setupSocketServer = require('./src/socket/socket.server');
const connectDB = require('./src/db/db');
const http = require('http');

const server = http.createServer(app);
setupSocketServer(server);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });


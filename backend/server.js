require('dotenv').config();
const app = require('./src/app');
const setupSocketServer = require('./src/socket/socket.server');
const connectDB = require('./src/db/db');
connectDB();

const http = require('http');

const server = http.createServer(app);
setupSocketServer(server);

server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
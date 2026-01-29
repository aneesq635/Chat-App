const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors')

const app = express();
app.use(cors());
const httpserver = http.createServer(app);

dotenv.config();

const io = new Server(httpserver, {
  path: "/socket.io/", // Custom path
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000, // Increase timeout
});


// chat system between two users

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
});



const PORT = process.env.PORT || 5000;

httpserver.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

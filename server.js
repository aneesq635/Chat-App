const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

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
const users = new Map();

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("register_user", (userId) => {
    users.set(userId, socket.id);
    console.log("user register with id", userId);
  });

  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    const { chatId, message } = data;
    const socket_id = users.get(message.reciever_id);
    console.log("Sending message to socket id:", socket_id);
    if (socket_id) {
      io.to(socket_id).emit("recieve_message", data);
    }
  });





  socket.on("disconnect", ()=>{
    for(const [userId, socketId] of users.entries()){
      if(socketId == socket.id){
        users.delete(userId);
        console.log(`User ${userId} Disconnected`);
        break;
      }
    }
  })


  
});

const PORT = process.env.PORT || 5000;

httpserver.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import {io} from "socket.io-client";

const socketPath = "/socket.io/"; // Matches your Caddy reverse proxy path

export const socketURL = 'http://localhost:5000'; // Update with your server URL

const socketConfig = {
  path: socketPath,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketURL, socketConfig);
  }
  return socket;
};

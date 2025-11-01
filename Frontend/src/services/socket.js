import { io } from "socket.io-client";

// Use Vite env variable for the API/socket server. Expects VITE_API_URL like: http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;

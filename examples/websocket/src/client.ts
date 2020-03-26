import { WebSocket } from "ws";

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
  console.log("Client connected");
  socket.send("Hello from client");
});

socket.on("message", (data) => {
  console.log(`Server message [${data.toString("utf8")}]`);
});

socket.on("close", () => {
  console.log("Client disconnected");
});

socket.on("error", (err) => {
  console.error(err);
  socket.close();
});

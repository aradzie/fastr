import { createServer } from "node:http";
import { Application } from "@fastr/core";
import { websocket } from "@fastr/middleware-websocket";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ noServer: true });

server.on("connection", (client): void => {
  console.log("Client connected");

  const timer = setInterval(() => {
    client.send(new Date().toJSON());
  }, 1000);

  client.on("message", (data) => {
    console.log(`Client message [${data.toString("utf8")}]`);
  });

  client.on("close", () => {
    console.log("Client disconnected");
    clearTimeout(timer);
  });

  client.on("error", (err) => {
    console.error(err);
    client.close();
  });

  client.send("Hello from server");
});

const app = new Application();

app.use(websocket(server));

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

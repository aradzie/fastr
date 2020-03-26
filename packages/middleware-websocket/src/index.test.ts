import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";
import { WebSocket, WebSocketServer } from "ws";
import { websocket } from "./index.js";

test("require upgrade", async (t) => {
  // Arrange.

  const server = start(
    new Application().use(websocket(newWebSocketServer())).callback(),
  );

  // Act.

  const response = await request.use(server).GET("/").send();

  // Assert.

  const { status, statusText, headers } = response;
  t.is(status, 426);
  t.is(statusText, "Upgrade Required");
  t.is(headers.get("Connection"), "close");
  t.is(headers.get("Upgrade"), "websocket");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "Upgrade to websocket required");
});

test("connect to web socket server", async (t) => {
  // Arrange.

  const server = start(
    new Application().use(websocket(newWebSocketServer())).callback(),
  );

  // Act.

  const webSocket = new WebSocket(toWebSocketUrl(server.origin));

  const result = await new Promise((resolve, reject) => {
    webSocket.on("open", () => {
      webSocket.close();
      resolve("ok");
    });

    webSocket.on("error", (err) => {
      webSocket.close();
      reject("error");
    });
  });

  // Assert.

  t.is(result, "ok");
});

function newWebSocketServer() {
  const server = new WebSocketServer({ noServer: true });

  server.on("connection", (socket) => {
    socket.on("ping", (data) => {
      socket.pong(data);
    });
    socket.on("pong", (data) => {
      socket.ping(data);
    });
    socket.on("message", (message) => {
      socket.send(message);
    });
    socket.send("data");
  });

  return server;
}

function toWebSocketUrl(urlString: string) {
  const url = new URL(urlString);
  switch (url.protocol) {
    case "http:":
      url.protocol = "ws:";
      break;
    case "https":
      url.protocol = "wss:";
      break;
  }
  return String(url);
}

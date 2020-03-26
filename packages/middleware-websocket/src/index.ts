import { type Context, type Middleware, type Request } from "@fastr/core";
import { Upgrade } from "@fastr/headers";
import { type WebSocket, type WebSocketServer } from "ws";

export interface WebSocketOptions {
  readonly head?: Buffer;
  readonly callback?: (client: WebSocket, ctx: Context) => void;
}

export function websocket(
  server: WebSocketServer,
  { head = Buffer.alloc(0), callback = () => {} }: WebSocketOptions = {},
): Middleware {
  return (ctx: Context): void => {
    const { request, response } = ctx;
    const { req } = request;
    if (isUpgradeWebSocket(request) && server.shouldHandle(req)) {
      response.hijack();
      server.handleUpgrade(req, req.socket, head, (client, request) => {
        callback(client, ctx);
        server.emit("connection", client, request);
      });
    } else {
      // https://www.rfc-editor.org/rfc/rfc7231#section-6.5.15
      response.status = 426;
      response.headers.set("Connection", "close");
      response.headers.set("Upgrade", "websocket");
      response.body = "Upgrade to websocket required";
    }
  };
}

function isUpgradeWebSocket({ headers }: Request): boolean {
  const connection = headers.get("connection");
  const upgrade = headers.get("upgrade");
  return (
    connection != null &&
    upgrade != null &&
    connection.toLowerCase() === "upgrade" &&
    Upgrade.parse(upgrade).has("websocket")
  );
}

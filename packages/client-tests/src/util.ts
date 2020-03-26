import { Body } from "@fastr/body";
import { type IncomingMessage, type ServerResponse } from "http";

export function reflect(req: IncomingMessage, res: ServerResponse): void {
  const { url, method } = req;
  const headers = { ...req.headers };
  delete headers.host;
  Body.from(req)
    .text()
    .then((body) => {
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          url,
          method,
          headers,
          body,
        }),
      );
    })
    .catch((err) => {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end(String(err));
    });
}

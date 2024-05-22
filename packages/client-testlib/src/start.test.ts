import http, { type IncomingMessage, type ServerResponse } from "node:http";
import https from "node:https";
import { request } from "@fastr/client";
import test from "ava";
import { start } from "./start.js";
import { cert, key } from "./test/cert.js";

test("start with a listener function", async (t) => {
  const response = await request //
    .use(start(listener))
    .GET("/")
    .send();

  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "hello");
});

test("start with a HTTP server", async (t) => {
  const server = http.createServer({}, listener);
  const response = await request //
    .use(start(server))
    .GET("/")
    .options({})
    .send();

  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "hello");
});

test("start with a HTTPS server", async (t) => {
  const server = https.createServer({ key, cert }, listener);
  const response = await request //
    .use(start(server))
    .GET("/")
    .options({ rejectUnauthorized: false })
    .send();

  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "hello");
});

function listener(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader("content-type", "text/plain");
  res.end("hello");
}

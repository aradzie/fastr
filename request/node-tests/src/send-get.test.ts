import { MimeType } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import { test } from "./util";

test("get text", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("text response");
  });

  // Act.

  const { ok, status, statusText, headers, body } = await request({
    url: server.url("/test"),
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(headers.contentType(), MimeType.TEXT_PLAIN);
  t.is(await body.text(), "text response");
});

test("get buffer", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/octet-stream");
    res.end("buffer response");
  });

  // Act.

  const { ok, status, statusText, headers, body } = await request({
    url: server.url("/test"),
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(headers.contentType(), MimeType.APPLICATION_OCTET_STREAM);
  t.is((await body.buffer()).toString("utf8"), "buffer response");
});

test("get json", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ type: "json" }));
  });

  // Act.

  const { ok, status, statusText, headers, body } = await request({
    url: server.url("/test"),
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(headers.contentType(), MimeType.APPLICATION_JSON);
  t.deepEqual(await body.json(), { type: "json" });
});

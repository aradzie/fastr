import {
  expectType,
  HasMiddleware,
  HttpRequest,
  request,
} from "@webfx-request/node";
import { test } from "./util";

test("return response if content type matches", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("text");
  });

  // Act.

  const { ok, status, statusText } = await request({
    url: server.url("/test"),
    method: "GET",
    middleware: [expectType("text/plain")],
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
});

test("throw error if content type does not match", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end("{");
  });

  // Assert.

  const init: HttpRequest & HasMiddleware = {
    url: server.url("/test"),
    method: "GET",
    middleware: [expectType("text/plain")],
  };
  await t.throwsAsync(
    async () => {
      await request(init);
    },
    {
      name: "UnsupportedMediaTypeError",
      message: "Unsupported Media Type",
    },
  );
});

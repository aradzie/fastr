import { expectType, HttpRequest, request } from "@webfx-request/node";
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

  const { ok, status, statusText } = await request.use(
    expectType("text/plain"),
  )({
    url: server.url("/test"),
    method: "GET",
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

  const init: HttpRequest = {
    url: server.url("/test"),
    method: "GET",
  };
  await t.throwsAsync(
    async () => {
      await request.use(expectType("text/plain"))(init);
    },
    {
      name: "UnsupportedMediaTypeError",
      message: "Unsupported Media Type",
    },
  );
});

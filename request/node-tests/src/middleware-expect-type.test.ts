import { expectType, request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";

test("return response if content type matches", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("text");
  });
  const req = request.use(server).use(expectType("text/plain"));

  // Act.

  const { ok, status, statusText } = await req({
    url: "/test",
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
});

test("throw error if content type does not match", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end("{");
  });
  const req = request.use(server).use(expectType("text/plain"));

  // Assert.

  await t.throwsAsync(
    async () => {
      await req({
        url: "/test",
        method: "GET",
      });
    },
    {
      name: "HttpError [415]",
      message: "Unsupported Media Type",
    },
  );
});

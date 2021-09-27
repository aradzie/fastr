import { MediaType } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";

test("get text", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.end("text response");
  });
  const req = request.use(server);

  // Act.

  const { ok, status, statusText, headers, body } = await req({
    url: "/test",
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(
    headers.map("Content-Type", MediaType.parse),
    MediaType.TEXT_PLAIN,
  );
  t.is(await body.text(), "text response");
});

test("get buffer", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.setHeader("Content-Type", "application/octet-stream");
    res.end("buffer response");
  });
  const req = request.use(server);

  // Act.

  const { ok, status, statusText, headers, body } = await req({
    url: "/test",
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(
    headers.map("Content-Type", MediaType.parse),
    MediaType.APPLICATION_OCTET_STREAM,
  );
  t.is(await body.text(), "buffer response");
});

test("get json", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ type: "json" }));
  });
  const req = request.use(server);

  // Act.

  const { ok, status, statusText, headers, body } = await req({
    url: "/test",
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.deepEqual(
    headers.map("Content-Type", MediaType.parse),
    MediaType.APPLICATION_JSON,
  );
  t.deepEqual(await body.json(), { type: "json" });
});

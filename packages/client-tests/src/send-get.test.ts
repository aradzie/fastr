import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { ContentType } from "@fastr/headers";
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
  t.is(String(ContentType.get(headers)), "text/plain");
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
  t.is(String(ContentType.get(headers)), "application/octet-stream");
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
  t.is(String(ContentType.get(headers)), "application/json");
  t.deepEqual(await body.json(), { type: "json" });
});

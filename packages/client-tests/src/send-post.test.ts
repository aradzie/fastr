import { Streamable } from "@fastr/body";
import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import test from "ava";
import { Readable } from "stream";
import { reflect } from "./util.js";

test("post text", async (t) => {
  // Arrange.

  const server = start(reflect);
  const req = request.use(server);

  // Act.

  const { ok, body } = await req({
    url: "/test",
    method: "POST",
    body: "string body",
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    url: "/test",
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "content-length": "11",
      "connection": "close",
    },
    body: "string body",
  });
});

test("post buffer", async (t) => {
  // Arrange.

  const server = start(reflect);
  const req = request.use(server);

  // Act.

  const { ok, body } = await req({
    url: "/test",
    method: "POST",
    body: Buffer.from("buffer body"),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    url: "/test",
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "content-length": "11",
      "connection": "close",
    },
    body: "buffer body",
  });
});

test("post readable", async (t) => {
  // Arrange.

  const server = start(reflect);
  const req = request.use(server);

  // Act.

  const { ok, body } = await req({
    url: "/test",
    method: "POST",
    body: Readable.from([
      Buffer.from("stream"),
      Buffer.from(" "),
      Buffer.from("body"),
    ]),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    url: "/test",
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "transfer-encoding": "chunked",
      "connection": "close",
    },
    body: "stream body",
  });
});

test("post streamable", async (t) => {
  // Arrange.

  const server = start(reflect);
  const req = request.use(server);

  // Act.

  const { ok, body } = await req({
    url: "/test",
    method: "POST",
    body: new (class extends Streamable {
      length(): number | null {
        return null;
      }

      open(): Readable {
        return Readable.from([
          Buffer.from("stream"),
          Buffer.from(" "),
          Buffer.from("body"),
        ]);
      }
    })(),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    url: "/test",
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "transfer-encoding": "chunked",
      "connection": "close",
    },
    body: "stream body",
  });
});

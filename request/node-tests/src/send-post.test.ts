import { Body } from "@webfx-http/body";
import { Headers } from "@webfx-http/headers";
import { request } from "@webfx/node-request";
import { Json } from "@webfx/request-json";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { URLSearchParams } from "url";
import { test } from "./util";

const largePayload = "large payload\n".repeat(1000);

test("post string", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: "string body",
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "11",
      "content-type": "text/plain",
    },
    body: "string body",
  });
});

test("post json", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: new Json({ type: "json" }),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "15",
      "content-type": "application/json",
    },
    body: '{"type":"json"}',
  });
});

test("post form", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: new URLSearchParams("a=1&b=2"),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "7",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "a=1&b=2",
  });
});

test("post buffer", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: Buffer.from("buffer body"),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "11",
      "content-type": "application/octet-stream",
    },
    body: "buffer body",
  });
});

test("post array buffer", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: toArrayBuffer("array buffer body"),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "17",
      "content-type": "application/octet-stream",
    },
    body: "array buffer body",
  });
});

test("post array buffer view", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: new Uint8Array(toArrayBuffer("array buffer view body")),
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "content-length": "22",
      "content-type": "application/octet-stream",
    },
    body: "array buffer view body",
  });
});

test("post stream", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
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
    headers: {
      "transfer-encoding": "chunked",
      "content-type": "application/octet-stream",
    },
    body: "stream body",
  });
});

test("post compressible string", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: {
      data: largePayload,
      compressible: true,
    },
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "transfer-encoding": "chunked",
      "content-encoding": "gzip",
      "content-type": "text/plain",
    },
    body: largePayload,
  });
});

test("post compressible buffer", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: {
      data: Buffer.from(largePayload),
      compressible: true,
    },
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "transfer-encoding": "chunked",
      "content-encoding": "gzip",
      "content-type": "application/octet-stream",
    },
    body: largePayload,
  });
});

test("post compressible stream", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
    method: "POST",
    body: {
      data: Readable.from([Buffer.from(largePayload)]),
      compressible: true,
    },
  });

  // Assert.

  t.true(ok);
  t.deepEqual(await body.json(), {
    headers: {
      "transfer-encoding": "chunked",
      "content-encoding": "gzip",
      "content-type": "application/octet-stream",
    },
    body: largePayload,
  });
});

async function listener(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const headers = Headers.fromJSON(req.headers)
    .toBuilder()
    .delete("host")
    .delete("connection")
    .build();
  const body = Body.from(req);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      headers: headers.toJSON(),
      body: await body.text(),
    }),
  );
}

function toArrayBuffer(text: string): ArrayBuffer {
  const buffer = Buffer.from(text);
  const arrayBuffer = new ArrayBuffer(buffer.length);
  buffer.copy(new Uint8Array(arrayBuffer));
  return arrayBuffer;
}

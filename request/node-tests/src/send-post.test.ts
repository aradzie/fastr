import { Body } from "@webfx-http/body";
import { Headers } from "@webfx-http/headers";
import { request, Streamable } from "@webfx-request/node";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { test } from "./util";

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
    },
    body: "string body",
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
    },
    body: "array buffer view body",
  });
});

test("post readable", async (t) => {
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
    },
    body: "stream body",
  });
});

test("post streamable", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", listener);

  // Act.

  const { ok, body } = await request({
    url: server.url("/test"),
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
    headers: {
      "transfer-encoding": "chunked",
    },
    body: "stream body",
  });
});

async function listener(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const headers = Headers.from(req.headers)
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

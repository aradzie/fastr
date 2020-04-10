import { Body } from "@webfx-http/body";
import { request, Streamable } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";

test("post text", async (t) => {
  // Arrange.

  const server = start(describeRequest);
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
      "content-length": "11",
    },
    body: "string body",
  });
});

test("post buffer", async (t) => {
  // Arrange.

  const server = start(describeRequest);
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
      "content-length": "11",
    },
    body: "buffer body",
  });
});

test("post readable", async (t) => {
  // Arrange.

  const server = start(describeRequest);
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
      "transfer-encoding": "chunked",
    },
    body: "stream body",
  });
});

test("post streamable", async (t) => {
  // Arrange.

  const server = start(describeRequest);
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
      "transfer-encoding": "chunked",
    },
    body: "stream body",
  });
});

function describeRequest(req: IncomingMessage, res: ServerResponse): void {
  const { method, url } = req;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  Body.from(req)
    .text()
    .then((body) => {
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          url,
          method,
          headers,
          body,
        }),
      );
    })
    .catch((err) => {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end(String(err));
    });
}

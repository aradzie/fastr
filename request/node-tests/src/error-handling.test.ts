import { request } from "@webfx-request/node";
import { Readable } from "stream";
import { test } from "./util";

test("handle connection refused", async (t) => {
  await t.throwsAsync(
    async () => {
      await request({
        url: "http://127.0.0.1:1/",
        method: "GET",
      });
    },
    {
      name: "Error",
      code: "ECONNREFUSED",
      message: "connect ECONNREFUSED 127.0.0.1:1",
    },
  );
});

test("handle request aborted", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", (req, res) => {
    res.write("payload\n");
    res.write("payload\n");
    res.write("payload\n");
    req.destroy();
  });

  // Assert.

  await t.throwsAsync(
    async () => {
      await request({
        url: server.url("/test"),
        method: "POST",
        body: "payload\n".repeat(1000),
      });
    },
    {
      name: "Error",
      code: "ECONNRESET",
      message: "socket hang up",
    },
  );
});

test("handle response aborted", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("POST", "/test", (req, res) => {
    res.write("payload\n");
    res.write("payload\n");
    res.write("payload\n");
    res.destroy();
  });

  // Assert.

  await t.throwsAsync(
    async () => {
      await request({
        url: server.url("/test"),
        method: "POST",
        body: "payload\n".repeat(1000),
      });
    },
    {
      name: "Error",
      code: "ECONNRESET",
      message: "socket hang up",
    },
  );
});

test("handle invalid content encoding", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.setHeader("Content-Encoding", "invalid");
    res.write("payload\n");
    res.write("payload\n");
    res.write("payload\n");
    res.end();
  });

  // Assert.

  await t.throwsAsync(
    async () => {
      await request({
        url: server.url("/test"),
        method: "GET",
      });
    },
    {
      name: "BadRequestError",
      message: "Invalid content encoding",
    },
  );
});

test("handle malformed content encoding", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.setHeader("Content-Encoding", "gzip");
    res.write("malformed gzip payload\n");
    res.write("malformed gzip payload\n");
    res.write("malformed gzip payload\n");
    res.end();
  });

  const response = await request({
    url: server.url("/test"),
    method: "GET",
  });

  // Assert.

  await t.throwsAsync(
    async () => {
      await response.body.text();
    },
    {
      name: "BadRequestError",
      message: "Invalid gzip data",
    },
  );
});

test("handle send body error", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.end();
  });

  const error = new Error("omg");

  // Assert.

  await t.throwsAsync(
    async () => {
      await request({
        url: server.url("/test"),
        method: "GET",
        body: new Readable({
          read(): void {
            this.emit("error", error);
          },
        }),
      });
    },
    {
      is: error,
    },
  );
  await t.throwsAsync(
    async () => {
      await request({
        url: server.url("/test"),
        method: "GET",
        body: new Readable({
          read(): void {
            this.destroy(error);
          },
        }),
      });
    },
    {
      is: error,
    },
  );
});

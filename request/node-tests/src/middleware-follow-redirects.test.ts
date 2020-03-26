import { MimeType } from "@webfx-http/headers";
import {
  followRedirects,
  HasMiddleware,
  HttpRequest,
  RedirectError,
  request,
} from "@webfx/node-request";
import { test } from "./util";

const payload = "server response\n".repeat(1000);

test("on redirect follow", async (t) => {
  const { server } = t.context;

  // Arrange.

  server
    .addRoute("GET", "/a", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/b");
      res.end(payload);
    })
    .addRoute("GET", "/b", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/c");
      res.end(payload);
    })
    .addRoute("GET", "/c", (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("done");
    });

  // Act.

  const { ok, status, statusText, url, headers, body } = await request({
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "follow" })],
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.is(String(url), server.url("/c"));
  t.deepEqual(headers.contentType(), MimeType.TEXT_PLAIN);
  t.is((await body.buffer()).toString("utf8"), "done");
});

test("on redirect follow to not found", async (t) => {
  const { server } = t.context;

  // Arrange.

  server
    .addRoute("GET", "/a", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/b");
      res.end(payload);
    })
    .addRoute("GET", "/b", (req, res) => {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("this is the end");
    });

  // Act.

  const { ok, status, statusText, url, headers, body } = await request({
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "follow" })],
  });

  // Assert.

  t.false(ok);
  t.is(status, 404);
  t.is(statusText, "Not Found");
  t.is(String(url), server.url("/b"));
  t.deepEqual(headers.contentType(), MimeType.TEXT_PLAIN);
  t.is((await body.buffer()).toString("utf8"), "this is the end");
});

test("on redirect return", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/a", (req, res) => {
    res.statusCode = 302;
    res.setHeader("Location", "/b");
    res.setHeader("Content-Type", "text/plain");
    res.end("done");
  });

  // Act.

  const { ok, status, statusText, url, headers, body } = await request({
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "manual" })],
  });

  // Assert.

  t.false(ok);
  t.is(status, 302);
  t.is(statusText, "Found");
  t.is(String(url), server.url("/a"));
  t.deepEqual(headers.contentType(), MimeType.TEXT_PLAIN);
  t.is((await body.buffer()).toString("utf8"), "done");
});

test("on redirect throw", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/a", (req, res) => {
    res.statusCode = 302;
    res.setHeader("Location", "/b");
    res.end(payload);
  });

  // Assert.

  const init: HttpRequest & HasMiddleware = {
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "error" })],
  };
  await t.throwsAsync(
    async () => {
      await request(init);
    },
    {
      instanceOf: RedirectError,
      message: "Redirect response detected",
    },
  );
});

test("handle no redirect location", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/a", (req, res) => {
    res.statusCode = 302;
    res.end();
  });

  // Assert.

  const init: HttpRequest & HasMiddleware = {
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "follow" })],
  };
  await t.throwsAsync(
    async () => {
      await request(init);
    },
    {
      instanceOf: RedirectError,
      message: "Redirect has no location",
    },
  );
});

test("handle redirect loop", async (t) => {
  const { server } = t.context;

  // Arrange.

  server
    .addRoute("GET", "/a", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/b");
      res.end();
    })
    .addRoute("GET", "/b", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/a");
      res.end();
    });

  // Assert.

  const init: HttpRequest & HasMiddleware = {
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "follow" })],
  };
  await t.throwsAsync(
    async () => {
      await request(init);
    },
    {
      instanceOf: RedirectError,
      message: "Redirect loop detected",
    },
  );
});

test("handle too many redirects", async (t) => {
  const { server } = t.context;

  // Arrange.

  server
    .addRoute("GET", "/a", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/b");
      res.end();
    })
    .addRoute("GET", "/b", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/c");
      res.end();
    })
    .addRoute("GET", "/c", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/d");
      res.end();
    })
    .addRoute("GET", "/d", (req, res) => {
      res.statusCode = 302;
      res.setHeader("Location", "/e");
      res.end();
    });

  // Assert.

  const init: HttpRequest & HasMiddleware = {
    url: server.url("/a"),
    method: "GET",
    middleware: [followRedirects({ redirect: "follow" })],
  };
  await t.throwsAsync(
    async () => {
      await request(init);
    },
    {
      instanceOf: RedirectError,
      message: "Too many redirects",
    },
  );
});

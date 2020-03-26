import {
  followRedirects,
  HttpHeaders,
  request,
  RequestError,
} from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { MediaType } from "@fastr/headers";
import test from "ava";
import { reflect } from "./util.js";

const payload = "server response\n".repeat(1000);

test("on redirect follow and keep request body", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    switch (req.url) {
      case "/a":
        res.statusCode = 308;
        res.setHeader("Location", "/b");
        res.setHeader("Content-Type", "text/plain");
        res.end(payload);
        break;
      case "/b":
        res.statusCode = 308;
        res.setHeader("Location", "/c");
        res.setHeader("Content-Type", "text/plain");
        res.end(payload);
        break;
      case "/c":
        reflect(req, res);
        break;
    }
  });

  // Act.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  const { ok, status, statusText, url, body } = await req({
    url: "/a",
    method: "PUT",
    headers: new HttpHeaders([
      ["Content-Type", "text/plain"],
      ["Content-Length", 5],
      ["X-Extra", "something"],
    ]),
    body: "hello",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.true(url.endsWith("/c"));
  t.deepEqual(await body.json(), {
    url: "/c",
    method: "PUT",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "connection": "close",
      "content-type": "text/plain",
      "content-length": "5",
      "x-extra": "something",
    },
    body: "hello",
  });
});

test("on redirect follow and discard request body", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    switch (req.url) {
      case "/a":
        res.statusCode = 303;
        res.setHeader("Location", "/b");
        res.setHeader("Content-Type", "text/plain");
        res.end(payload);
        break;
      case "/b":
        res.statusCode = 303;
        res.setHeader("Location", "/c");
        res.setHeader("Content-Type", "text/plain");
        res.end(payload);
        break;
      case "/c":
        reflect(req, res);
        break;
    }
  });

  // Act.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  const { ok, status, statusText, url, body } = await req({
    url: "/a",
    method: "PUT",
    headers: new HttpHeaders([
      ["Content-Type", "text/plain"],
      ["Content-Length", 5],
      ["X-Extra", "something"],
    ]),
    body: "hello",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.true(url.endsWith("/c"));
  t.deepEqual(await body.json(), {
    url: "/c",
    method: "GET",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "connection": "close",
      "x-extra": "something",
    },
    body: "",
  });
});

test("on redirect follow to not found", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    switch (req.url) {
      case "/a":
        res.statusCode = 302;
        res.setHeader("Location", "/b");
        res.end(payload);
        break;
      case "/b":
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("this is the end");
        break;
    }
  });

  // Act.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  const { ok, status, statusText, url, headers, body } = await req({
    url: "/a",
    method: "GET",
  });

  // Assert.

  t.false(ok);
  t.is(status, 404);
  t.is(statusText, "Not Found");
  t.true(url.endsWith("/b"));
  t.deepEqual(
    headers.map("Content-Type", MediaType.parse),
    new MediaType("text", "plain"),
  );
  t.is(await body.text(), "this is the end");
});

test("on redirect return", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.statusCode = 302;
    res.setHeader("Location", "/b");
    res.setHeader("Content-Type", "text/plain");
    res.end("done");
  });

  // Act.

  const req = request.use(followRedirects({ redirect: "manual" })).use(server);
  const { ok, status, statusText, url, headers, body } = await req({
    url: "/a",
    method: "GET",
  });

  // Assert.

  t.false(ok);
  t.is(status, 302);
  t.is(statusText, "Found");
  t.true(url.endsWith("/a"));
  t.deepEqual(
    headers.map("Content-Type", MediaType.parse),
    new MediaType("text", "plain"),
  );
  t.is(await body.text(), "done");
});

test("on redirect throw", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.statusCode = 302;
    res.setHeader("Location", "/b");
    res.end(payload);
  });

  // Assert.

  const req = request.use(followRedirects({ redirect: "error" })).use(server);
  await t.throwsAsync(
    req({
      url: "/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Redirect response detected",
    },
  );
});

test("handle no redirect location", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    res.statusCode = 302;
    res.end();
  });

  // Assert.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  await t.throwsAsync(
    req({
      url: "/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Redirect has no location",
    },
  );
});

test("handle redirect loop", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    switch (req.url) {
      case "/a":
        res.statusCode = 302;
        res.setHeader("Location", "/b");
        res.end();
        break;
      case "/b":
        res.statusCode = 302;
        res.setHeader("Location", "/a");
        res.end();
        break;
    }
  });

  // Assert.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  await t.throwsAsync(
    req({
      url: "/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Redirect loop detected",
    },
  );
});

test("handle too many redirects", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    switch (req.url) {
      case "/a":
        res.statusCode = 302;
        res.setHeader("Location", "/b");
        res.end();
        break;
      case "/b":
        res.statusCode = 302;
        res.setHeader("Location", "/c");
        res.end();
        break;
      case "/c":
        res.statusCode = 302;
        res.setHeader("Location", "/d");
        res.end();
        break;
      case "/d":
        res.statusCode = 302;
        res.setHeader("Location", "/e");
        res.end();
        break;
    }
  });

  // Assert.

  const req = request.use(followRedirects({ redirect: "follow" })).use(server);
  await t.throwsAsync(
    req({
      url: "/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Too many redirects",
    },
  );
});

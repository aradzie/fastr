import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application, compose, Context, Request, Response } from "@fastr/core";
import { FakeIncomingMessage, FakeOutgoingMessage } from "@fastr/fake-http";
import test from "ava";
import { canonical } from "./index.js";

test("redirect to canonical url", async (t) => {
  const app = new Application(null, { behindProxy: true })
    .use(canonical("https://www.example.com/ignored?x=y"))
    .use((ctx) => {
      ctx.response.headers.set("X-Request-Url", ctx.request.url);
      ctx.response.body = "ok";
    });
  const req = request.use(start(app.callback()));

  {
    // Match canonical URL.
    const res = await req
      .GET("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "www.example.com")
      .header("X-Forwarded-Proto", "https")
      .send();
    t.is(res.status, 200);
    t.is(res.headers.get("Location"), null);
    t.is(await res.body.text(), "ok");
  }

  {
    // Change domain name.
    const res = await req
      .GET("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "example.com")
      .header("X-Forwarded-Proto", "https")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("Location"), "https://www.example.com/foo/bar?a=b");
    t.is(
      await res.body.text(),
      "Redirecting to https://www.example.com/foo/bar?a=b",
    );
  }

  {
    // Change protocol.
    const res = await req
      .GET("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "www.example.com")
      .header("X-Forwarded-Proto", "http")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("Location"), "https://www.example.com/foo/bar?a=b");
    t.is(
      await res.body.text(),
      "Redirecting to https://www.example.com/foo/bar?a=b",
    );
  }

  // Change domain name and protocol.
  {
    const res = await req
      .GET("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "example.com")
      .header("X-Forwarded-Proto", "http")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("Location"), "https://www.example.com/foo/bar?a=b");
    t.is(
      await res.body.text(),
      "Redirecting to https://www.example.com/foo/bar?a=b",
    );
  }

  // Change domain name and protocol, ignored HTTP method.
  {
    const res = await req
      .PUT("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "example.com")
      .header("X-Forwarded-Proto", "http")
      .send();
    t.is(res.status, 200);
    t.is(res.headers.get("Location"), null);
    t.is(await res.body.text(), "ok");
  }
});

test("check any method", async (t) => {
  // Arrange.

  const middleware = compose([
    canonical("https://www.example.com/ignored?x=y", ["*"]),
    (ctx) => {
      ctx.response.headers.set("X-Request-Url", ctx.request.url);
      ctx.response.body = "ok";
    },
  ]);

  const context = makeContext("PUT", "/foo/bar?a=b");

  // Act.

  await middleware(context, async () => {});

  // Assert.

  const { response } = context;
  t.is(response.status, 301);
  t.is(response.headers.get("Location"), "https://www.example.com/foo/bar?a=b");
  t.is(response.body, "Redirecting to https://www.example.com/foo/bar?a=b");
});

test("request url includes host", async (t) => {
  // Arrange.

  const middleware = compose([
    canonical("https://www.example.com/ignored?x=y", ["*"]),
    (ctx) => {
      ctx.response.headers.set("X-Request-Method", ctx.request.method);
      ctx.response.headers.set("X-Request-Url", ctx.request.url);
      ctx.response.body = "ok";
    },
  ]);

  const context = makeContext("GET", "http://host:8080/path?x=1");

  // Act.

  await middleware(context, async () => {});

  // Assert.

  const { response } = context;
  t.is(response.status, 200);
  t.is(response.headers.get("X-Request-Method"), "GET");
  t.is(response.headers.get("X-Request-Url"), "http://host:8080/path?x=1");
  t.is(response.body, "ok");
});

test("request url is a wildcard", async (t) => {
  // Arrange.

  const middleware = compose([
    canonical("https://www.example.com/ignored?x=y", ["*"]),
    (ctx) => {
      ctx.response.headers.set("X-Request-Method", ctx.request.method);
      ctx.response.headers.set("X-Request-Url", ctx.request.url);
      ctx.response.body = "ok";
    },
  ]);

  const context = makeContext("OPTIONS", "*");

  // Act.

  await middleware(context, async () => {});

  // Assert.

  const { response } = context;
  t.is(response.status, 200);
  t.is(response.headers.get("X-Request-Method"), "OPTIONS");
  t.is(response.headers.get("X-Request-Url"), "*");
  t.is(response.body, "ok");
});

test("disable canonical", async (t) => {
  const app = new Application(null, { behindProxy: true })
    .use(canonical("*"))
    .use((ctx) => {
      ctx.response.headers.set("X-Request-Url", ctx.request.url);
      ctx.response.body = "ok";
    });
  const req = request.use(start(app.callback()));

  for (const host of ["abc.com", "www.abc.com", "xyz.com", "www.xyz.com"]) {
    for (const proto of ["http", "https"]) {
      const res = await req
        .GET("/foo/bar?a=b#x")
        .header("X-Forwarded-Host", host)
        .header("X-Forwarded-Proto", proto)
        .send();
      t.is(res.status, 200);
      t.is(res.headers.get("Location"), null);
      t.is(await res.body.text(), "ok");
    }
  }
});

function makeContext(method: string, url: string): Context {
  const request = new Request(
    new FakeIncomingMessage(null, {
      method,
      url,
      headers: {
        "X-Forwarded-Host": "example.com",
        "X-Forwarded-Proto": "http",
      },
    }) as any,
    { behindProxy: true },
  );
  const response = new Response(new FakeOutgoingMessage() as any);
  return new Context({} as any, request, response, { params: {} });
}

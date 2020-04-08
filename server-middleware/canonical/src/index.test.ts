import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import { Builder } from "@webfx/controller";
import test from "ava";
import { Container } from "inversify";
import Koa from "koa";
import { Canonical } from "./index";

test("redirect to canonical url", async (t) => {
  const app = new Koa();
  app.proxy = true;
  const container = new Container();
  container
    .bind("canonicalUrl")
    .toConstantValue("https://www.example.com/ignored?x=y");
  new Builder(container).use(app, Canonical).use(app, (ctx) => {
    ctx.response.body = "ok";
  });
  const req = request.use(start(app.callback()));

  // Match canonical URL.

  t.is(
    (
      await req
        .get("/foo/bar?a=b#x")
        .header("X-Forwarded-Host", "www.example.com")
        .header("X-Forwarded-Proto", "https")
        .send()
    ).headers.get("location"),
    null,
  );

  // Change domain name.
  t.is(
    (
      await req
        .get("/foo/bar?a=b#x")
        .header("X-Forwarded-Host", "example.com")
        .header("X-Forwarded-Proto", "https")
        .send()
    ).headers.get("location"),
    "https://www.example.com/foo/bar?a=b",
  );

  // Change protocol.
  t.is(
    (
      await req
        .get("/foo/bar?a=b#x")
        .header("X-Forwarded-Host", "www.example.com")
        .header("X-Forwarded-Proto", "http")
        .send()
    ).headers.get("location"),
    "https://www.example.com/foo/bar?a=b",
  );

  // Change domain name and protocol.
  t.is(
    (
      await req
        .get("/foo/bar?a=b#x")
        .header("X-Forwarded-Host", "example.com")
        .header("X-Forwarded-Proto", "http")
        .send()
    ).headers.get("location"),
    "https://www.example.com/foo/bar?a=b",
  );
});

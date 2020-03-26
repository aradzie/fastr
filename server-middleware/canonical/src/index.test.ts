import { Builder } from "@webfx/controller";
import test from "ava";
import { Container } from "inversify";
import Koa from "koa";
import supertest from "supertest";
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
  const agent = supertest.agent(app.listen());

  // Match canonical URL.
  t.is(
    (
      await agent
        .get("/foo/bar?a=b#x")
        .set("X-Forwarded-Host", "www.example.com")
        .set("X-Forwarded-Proto", "https")
    ).get("location"),
    undefined,
  );

  // Change domain name.
  t.is(
    (
      await agent
        .get("/foo/bar?a=b#x")
        .set("X-Forwarded-Host", "example.com")
        .set("X-Forwarded-Proto", "https")
    ).get("location"),
    "https://www.example.com/foo/bar?a=b",
  );

  // Change protocol.
  t.is(
    (
      await agent
        .get("/foo/bar?a=b#x")
        .set("X-Forwarded-Host", "www.example.com")
        .set("X-Forwarded-Proto", "http")
    ).get("location"),
    "https://www.example.com/foo/bar?a=b",
  );

  // Change domain name and protocol.
  t.is(
    (
      await agent
        .get("/foo/bar?a=b#x")
        .set("X-Forwarded-Host", "example.com")
        .set("X-Forwarded-Proto", "http")
    ).get("location"),
    "https://www.example.com/foo/bar?a=b",
  );
});

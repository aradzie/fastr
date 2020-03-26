import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";
import { canonical } from "./index.js";

test("redirect to canonical url", async (t) => {
  const app = new Application(null, { behindProxy: true })
    .use(canonical("https://www.example.com/ignored?x=y"))
    .use((ctx) => {
      ctx.response.body = "ok";
    });
  const req = request.use(start(app.callback()));

  {
    // Match canonical URL.
    const res = await req
      .get("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "www.example.com")
      .header("X-Forwarded-Proto", "https")
      .send();
    t.is(res.status, 200);
    t.is(res.headers.get("location"), null);
  }

  {
    // Change domain name.
    const res = await req
      .get("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "example.com")
      .header("X-Forwarded-Proto", "https")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("location"), "https://www.example.com/foo/bar?a=b");
  }

  {
    // Change protocol.
    const res = await req
      .get("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "www.example.com")
      .header("X-Forwarded-Proto", "http")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("location"), "https://www.example.com/foo/bar?a=b");
  }

  // Change domain name and protocol.
  {
    const res = await req
      .get("/foo/bar?a=b#x")
      .header("X-Forwarded-Host", "example.com")
      .header("X-Forwarded-Proto", "http")
      .send();
    t.is(res.status, 301);
    t.is(res.headers.get("location"), "https://www.example.com/foo/bar?a=b");
  }
});

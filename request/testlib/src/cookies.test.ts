import { Headers, SetCookie } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import test from "ava";
import { IncomingMessage, ServerResponse } from "http";
import { CookieJar } from "./cookiejar";
import { cookies } from "./cookies";
import { start } from "./start";

test("update cookie", async (t) => {
  const server = start(listener);
  const jar = new CookieJar();

  // First request with no cookies.
  {
    const { status, headers, body } = await request
      .get("/create")
      .use(server)
      .use(cookies(jar))
      .send();

    t.is(status, 200);
    t.deepEqual(headers.allSetCookies(), [new SetCookie("x", "abc")]);
    t.deepEqual(await body.json(), { requestCookies: [] });
    t.is(jar.get("x"), "abc");
  }

  // Second request with cookies from the previous response.
  {
    const { status, headers, body } = await request
      .get("/update")
      .use(server)
      .use(cookies(jar))
      .send();

    t.is(status, 200);
    t.deepEqual(headers.allSetCookies(), [new SetCookie("x", "xyz")]);
    t.deepEqual(await body.json(), { requestCookies: ["x=abc"] });
    t.is(jar.get("x"), "xyz");
  }

  // Delete cookies.
  {
    const { status, headers, body } = await request
      .get("/clear")
      .use(server)
      .use(cookies(jar))
      .send();

    t.is(status, 200);
    t.deepEqual(headers.allSetCookies(), [new SetCookie("x", "")]);
    t.deepEqual(await body.json(), { requestCookies: ["x=xyz"] });
    t.is(jar.get("x"), null);
  }
});

function listener(req: IncomingMessage, res: ServerResponse): void {
  const setCookie = [];
  switch (req.url) {
    case "/create":
      setCookie.push(new SetCookie("x", "abc"));
      break;
    case "/update":
      setCookie.push(new SetCookie("x", "xyz"));
      break;
    case "/clear":
      setCookie.push(new SetCookie("x", ""));
      break;
  }
  res.setHeader("Set-Cookie", setCookie.map(String));
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({ requestCookies: Headers.from(req.headers).allCookies() }),
  );
}

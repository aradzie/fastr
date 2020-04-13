import { Cookie, Headers, SetCookie } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import test from "ava";
import { IncomingMessage, ServerResponse } from "http";
import { CookieJar } from "./cookiejar";
import { cookies } from "./cookies";
import { start } from "./start";

test("update cookie", async (t) => {
  const jar = new CookieJar();
  const req = request.use(start(listener)).use(cookies(jar));

  // First request with no cookies.
  {
    const { status, headers, body } = await req.get("/create").send();

    t.is(status, 200);
    t.deepEqual(headers.mapAll("Set-Cookie", SetCookie.parse), [
      new SetCookie("x", "abc"),
    ]);
    t.deepEqual(await body.json(), { requestCookies: {} });
    t.is(jar.get("x"), "abc");
  }

  // Second request with cookies from the previous response.
  {
    const { status, headers, body } = await req.get("/update").send();

    t.is(status, 200);
    t.deepEqual(headers.mapAll("Set-Cookie", SetCookie.parse), [
      new SetCookie("x", "xyz"),
    ]);
    t.deepEqual(await body.json(), { requestCookies: { x: "abc" } });
    t.is(jar.get("x"), "xyz");
  }

  // Request with user-specified cookies.
  {
    const { status, headers, body } = await req
      .get("/update")
      .header("Cookie", "x=user")
      .send();

    t.is(status, 200);
    t.deepEqual(headers.mapAll("Set-Cookie", SetCookie.parse), [
      new SetCookie("x", "xyz"),
    ]);
    t.deepEqual(await body.json(), { requestCookies: { x: "user" } });
    t.is(jar.get("x"), "xyz");
  }

  // Delete cookies.
  {
    const { status, headers, body } = await req.get("/clear").send();

    t.is(status, 200);
    t.deepEqual(headers.mapAll("Set-Cookie", SetCookie.parse), [
      new SetCookie("x", "", { expires: new Date(0) }),
    ]);
    t.deepEqual(await body.json(), { requestCookies: { x: "xyz" } });
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
      setCookie.push(new SetCookie("x", "", { expires: new Date(0) }));
      break;
  }
  res.setHeader("Set-Cookie", setCookie.map(String));
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      requestCookies: Object.fromEntries(
        new Headers(req.headers).map("Cookie", Cookie.parse) ?? [],
      ),
    }),
  );
}

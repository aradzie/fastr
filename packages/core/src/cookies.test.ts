import test from "ava";
import { IncomingMessage, OutgoingMessage } from "http";
import { type Socket } from "net";
import { Cookies } from "./cookies.js";
import { IncomingMessageHeaders, OutgoingMessageHeaders } from "./headers.js";

test("get without the cookie request header", (t) => {
  const req = new IncomingMessage({} as Socket);
  const res = new OutgoingMessage();
  const cookies = new Cookies(
    new IncomingMessageHeaders(req),
    new OutgoingMessageHeaders(res),
  );

  t.is(cookies.size, 0);
  t.deepEqual([...cookies.keys()], []);
  t.is(cookies.has("name"), false);
  t.is(cookies.get("name"), null);
});

test("get with the cookie request header", (t) => {
  const req = new IncomingMessage({} as Socket);
  const res = new OutgoingMessage();

  req.headers["cookie"] = "name=value; a=x; b=y";

  const cookies = new Cookies(
    new IncomingMessageHeaders(req),
    new OutgoingMessageHeaders(res),
  );

  t.is(cookies.size, 3);
  t.deepEqual([...cookies.keys()], ["name", "a", "b"]);
  t.is(cookies.has("name"), true);
  t.is(cookies.get("name"), "value");
});

test("set", (t) => {
  const req = new IncomingMessage({} as Socket);
  const res = new OutgoingMessage();

  const cookies = new Cookies(
    new IncomingMessageHeaders(req),
    new OutgoingMessageHeaders(res),
  );

  cookies.set("name", "value");

  t.deepEqual(res.getHeader("set-cookie"), ["name=value"]);

  cookies.set("name", "new-value");

  t.deepEqual(res.getHeader("set-cookie"), ["name=new-value"]);

  cookies.delete("name");

  t.deepEqual(res.getHeader("set-cookie"), [
    "name=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);

  cookies.set("a", "x");

  t.deepEqual(res.getHeader("set-cookie"), [
    "name=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "a=x",
  ]);

  cookies.delete("a");

  t.deepEqual(res.getHeader("set-cookie"), [
    "name=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "a=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
});

test("set with options", (t) => {
  const req = new IncomingMessage({} as Socket);
  const res = new OutgoingMessage();

  const cookies = new Cookies(
    new IncomingMessageHeaders(req),
    new OutgoingMessageHeaders(res),
    {
      path: "/path",
      domain: "domain",
      maxAge: 100,
      expires: new Date(1000),
      sameSite: "Strict",
      secure: true,
      httpOnly: true,
    },
  );

  cookies.set("name", "value");

  t.deepEqual(res.getHeader("set-cookie"), [
    "name=value; " +
      "Path=/path; " +
      "Domain=domain; " +
      "Max-Age=100; " +
      "Expires=Thu, 01 Jan 1970 00:00:01 GMT; " +
      "SameSite=Strict; " +
      "Secure; " +
      "HttpOnly",
  ]);

  cookies.set("name", "value", {
    path: "/new-path",
    domain: "new-domain",
    maxAge: 200,
    expires: new Date(2000),
    sameSite: "Lax",
    secure: false,
    httpOnly: false,
  });

  t.deepEqual(res.getHeader("set-cookie"), [
    "name=value; " +
      "Path=/new-path; " +
      "Domain=new-domain; " +
      "Max-Age=200; " +
      "Expires=Thu, 01 Jan 1970 00:00:02 GMT; " +
      "SameSite=Lax",
  ]);
});

import test from "ava";
import { SetCookie } from "./set-cookie.js";

test("parse", (t) => {
  t.deepEqual(
    SetCookie.parse("Name0=Value0"),
    new SetCookie("Name0", "Value0"),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; path=path0"),
    new SetCookie("Name0", "Value0", {
      path: "path0",
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; domain=domain0"),
    new SetCookie("Name0", "Value0", {
      domain: "domain0",
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; max-Age=123"),
    new SetCookie("Name0", "Value0", {
      maxAge: 123,
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; expires=Thu, 01 Jan 1970 00:00:01 GMT"),
    new SetCookie("Name0", "Value0", {
      expires: new Date(1000),
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; sameSite=strict"),
    new SetCookie("Name0", "Value0", {
      sameSite: "Strict",
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; secure"),
    new SetCookie("Name0", "Value0", {
      secure: true,
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; httpOnly"),
    new SetCookie("Name0", "Value0", {
      httpOnly: true,
    }),
  );
  t.deepEqual(
    SetCookie.parse("Name0=Value0; extra=extra0"),
    new SetCookie("Name0", "Value0"),
  );
  t.deepEqual(
    SetCookie.parse(
      "Name0=Value0; " +
        "Path = path0 ; " +
        "Domain = domain0 ; " +
        "Max-Age = 123 ; " +
        "Expires = Thu, 01 Jan 1970 00:00:01 GMT ; " +
        "SameSite = STRICT ; " +
        "Secure ; " +
        "HttpOnly ; ",
    ),
    new SetCookie("Name0", "Value0", {
      path: "path0",
      domain: "domain0",
      maxAge: 123,
      expires: new Date(1000),
      sameSite: "Strict",
      secure: true,
      httpOnly: true,
    }),
  );
});

test("toString", (t) => {
  t.is(String(new SetCookie("Name0", "Value0")), "Name0=Value0");
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        path: "path0",
      }),
    ),
    "Name0=Value0; Path=path0",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        domain: "domain0",
      }),
    ),
    "Name0=Value0; Domain=domain0",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        maxAge: 123,
      }),
    ),
    "Name0=Value0; Max-Age=123",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        expires: new Date(1000),
      }),
    ),
    "Name0=Value0; Expires=Thu, 01 Jan 1970 00:00:01 GMT",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        sameSite: "Strict",
      }),
    ),
    "Name0=Value0; SameSite=Strict",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        secure: true,
      }),
    ),
    "Name0=Value0; Secure",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        httpOnly: true,
      }),
    ),
    "Name0=Value0; HttpOnly",
  );
  t.is(
    String(
      new SetCookie("Name0", "Value0", {
        path: "path0",
        domain: "domain0",
        maxAge: 123,
        expires: new Date(1000),
        sameSite: "Strict",
        secure: true,
        httpOnly: true,
      }),
    ),
    "Name0=Value0; " +
      "Path=path0; " +
      "Domain=domain0; " +
      "Max-Age=123; " +
      "Expires=Thu, 01 Jan 1970 00:00:01 GMT; " +
      "SameSite=Strict; " +
      "Secure; " +
      "HttpOnly",
  );
});

test("escape cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  t.is(SetCookie.parse(String(new SetCookie("name", value)))?.value, value);
});

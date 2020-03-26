import test from "ava";
import { SetCookie } from "./set-cookie.js";

test("parse empty values", (t) => {
  t.deepEqual(SetCookie.parse("a="), new SetCookie("a", ""));
  t.deepEqual(
    SetCookie.parse("a=; Max-Age=0"),
    new SetCookie("a", "", { maxAge: 0 }),
  );
});

test("parse simple values", (t) => {
  t.deepEqual(SetCookie.parse("a=1"), new SetCookie("a", "1"));
  t.deepEqual(
    SetCookie.parse("a=1; Max-Age=0"),
    new SetCookie("a", "1", { maxAge: 0 }),
  );
});

test("parse empty quoted values", (t) => {
  t.deepEqual(SetCookie.parse(`a=""`), new SetCookie("a", ""));
  t.deepEqual(
    SetCookie.parse(`a=""; Max-Age=0`),
    new SetCookie("a", "", { maxAge: 0 }),
  );
});

test("parse quoted values", (t) => {
  t.deepEqual(SetCookie.parse(`a="1"`), new SetCookie("a", "1"));
  t.deepEqual(
    SetCookie.parse(`a="1"; Max-Age=0`),
    new SetCookie("a", "1", { maxAge: 0 }),
  );
});

test("parse escaped values", (t) => {
  t.deepEqual(SetCookie.parse(`a=%00`), new SetCookie("a", "\x00"));
  t.deepEqual(
    SetCookie.parse(`a=%00; Max-Age=0`),
    new SetCookie("a", "\x00", { maxAge: 0 }),
  );
  t.deepEqual(SetCookie.parse(`b="%01"`), new SetCookie("b", "\x01"));
  t.deepEqual(
    SetCookie.parse(`b="%01"; Max-Age=0`),
    new SetCookie("b", "\x01", { maxAge: 0 }),
  );
  t.deepEqual(SetCookie.parse(`c=%%%`), new SetCookie("c", "%%%"));
  t.deepEqual(
    SetCookie.parse(`c=%%%; Max-Age=0`),
    new SetCookie("c", "%%%", { maxAge: 0 }),
  );
});

test("parse the Path attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; path=/a/b/c"),
    new SetCookie("a", "1", { path: "/a/b/c" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; PATH=/a/b/c"),
    new SetCookie("a", "1", { path: "/a/b/c" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; path="),
    new SetCookie("a", "1", { path: "" }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; path");
  });
  t.throws(() => {
    SetCookie.parse("a=1; path=/a/b/c; path=extra");
  });
});

test("parse the Domain attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; domain=something"),
    new SetCookie("a", "1", { domain: "something" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; DOMAIN=something"),
    new SetCookie("a", "1", { domain: "something" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; domain="),
    new SetCookie("a", "1", { domain: "" }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; domain");
  });

  t.throws(() => {
    SetCookie.parse("a=1; domain=something; domain=extra");
  });
});

test("parse the Max-Age attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; max-age=000"),
    new SetCookie("a", "1", { maxAge: 0 }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; max-age=123"),
    new SetCookie("a", "1", { maxAge: 123 }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; MAX-AGE=123"),
    new SetCookie("a", "1", { maxAge: 123 }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; max-age");
  });
  t.throws(() => {
    SetCookie.parse("a=1; max-age=");
  });
  t.throws(() => {
    SetCookie.parse("a=1; max-age=x");
  });
  t.throws(() => {
    SetCookie.parse("a=1; max-age=123.456");
  });
  t.throws(() => {
    SetCookie.parse("a=1; max-age=123; max-age=456");
  });
});

test("parse the Expires attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; expires=Thu, 01 Jan 1970 00:00:01 GMT"),
    new SetCookie("a", "1", { expires: new Date(1000) }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; EXPIRES=Thu, 01 Jan 1970 00:00:01 GMT"),
    new SetCookie("a", "1", { expires: new Date(1000) }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; expires");
  });
  t.throws(() => {
    SetCookie.parse("a=1; expires=");
  });
  t.throws(() => {
    SetCookie.parse(
      "a=1; " +
        "expires=Thu, 01 Jan 1970 00:00:01 GMT; " +
        "expires=Thu, 01 Jan 1970 00:00:02 GMT",
    );
  });
});

test("parse the SameSite attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; samesite=strict"),
    new SetCookie("a", "1", { sameSite: "Strict" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; SAMESITE=STRICT"),
    new SetCookie("a", "1", { sameSite: "Strict" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; samesite=lax"),
    new SetCookie("a", "1", { sameSite: "Lax" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; SAMESITE=LAX"),
    new SetCookie("a", "1", { sameSite: "Lax" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; samesite=none"),
    new SetCookie("a", "1", { sameSite: "None" }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; SAMESITE=NONE"),
    new SetCookie("a", "1", { sameSite: "None" }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; SameSite=what");
  });
  t.throws(() => {
    SetCookie.parse("a=1; SameSite");
  });
  t.throws(() => {
    SetCookie.parse("a=1; SameSite=");
  });
  t.throws(() => {
    SetCookie.parse("a=1; SameSite=Strict; SameSite=Lax");
  });
});

test("parse the Secure attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; secure"),
    new SetCookie("a", "1", { secure: true }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; SECURE"),
    new SetCookie("a", "1", { secure: true }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; Secure=true");
  });
  t.throws(() => {
    SetCookie.parse("a=1; Secure; Secure");
  });
});

test("parse the HttpOnly attribute", (t) => {
  t.deepEqual(
    SetCookie.parse("a=1; httponly"),
    new SetCookie("a", "1", { httpOnly: true }),
  );
  t.deepEqual(
    SetCookie.parse("a=1; HTTPONLY"),
    new SetCookie("a", "1", { httpOnly: true }),
  );
  t.throws(() => {
    SetCookie.parse("a=1; HttpOnly=true");
  });
  t.throws(() => {
    SetCookie.parse("a=1; HttpOnly; HttpOnly");
  });
});

test("parse all attributes", (t) => {
  t.deepEqual(
    SetCookie.parse(
      "Name0=Value0; " +
        "Path=path0; " +
        "Domain=domain0; " +
        "Max-Age=123; " +
        "Expires=Thu, 01 Jan 1970 00:00:01 GMT; " +
        "SameSite=STRICT; " +
        "Secure; " +
        "HttpOnly; ",
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

test("format empty value", (t) => {
  t.is(String(new SetCookie("one", "")), "one=");
});

test("format simple value", (t) => {
  t.is(String(new SetCookie("one", "1")), "one=1");
});

test("format escaped value", (t) => {
  t.is(String(new SetCookie("a", "\x00")), "a=%00");
  t.is(String(new SetCookie("a", '"?"')), "a=%22%3F%22");
});

test("format with attributes", (t) => {
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

test("format and parse escaped cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  t.is(SetCookie.parse(String(new SetCookie("name", value)))?.value, value);
});

test("validate cooke name", (t) => {
  t.throws(
    () => {
      new SetCookie("?", "anything");
    },
    { instanceOf: TypeError },
  );
});

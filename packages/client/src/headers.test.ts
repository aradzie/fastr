import test from "ava";
import { HttpHeaders } from "./headers.js";

test("reject invalid header names", (t) => {
  const headers = new HttpHeaders();

  t.throws(
    () => {
      headers.set("\0", "something");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
  t.throws(
    () => {
      headers.append("\0", "something");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
  t.throws(
    () => {
      headers.delete("\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
  t.throws(
    () => {
      headers.has("\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
  t.throws(
    () => {
      headers.get("\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
  t.throws(
    () => {
      headers.getAll("\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_NAME",
    },
  );
});

test("reject invalid header values", (t) => {
  const headers = new HttpHeaders();

  t.throws(
    () => {
      headers.set("header", "\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_VALUE",
    },
  );
  t.throws(
    () => {
      headers.append("header", "\0");
    },
    {
      instanceOf: TypeError,
      code: "ERR_INVALID_HEADER_VALUE",
    },
  );
});

test("get missing header", (t) => {
  const headers = new HttpHeaders();

  t.false(headers.has("foo"));
  t.is(headers.get("foo"), null);
  t.deepEqual(headers.getAll("foo"), []);

  t.false(headers.has("cookie"));
  t.is(headers.get("cookie"), null);
  t.deepEqual(headers.getAll("cookie"), []);

  t.false(headers.has("set-cookie"));
  t.is(headers.get("set-cookie"), null);
  t.deepEqual(headers.getAll("set-cookie"), []);
});

test("set simple header", (t) => {
  const headers = new HttpHeaders()
    .set("foo", "a")
    .set("Foo", "b")
    .set("FOO", "c");

  t.true(headers.has("foo"));
  t.is(headers.get("foo"), "c");
  t.deepEqual(headers.getAll("foo"), ["c"]);
  t.deepEqual(headers.toJSON(), {
    foo: "c",
  });
});

test("append simple header", (t) => {
  const headers = new HttpHeaders()
    .append("bar", "a")
    .append("Bar", "b")
    .append("BAR", "c");

  t.true(headers.has("bar"));
  t.is(headers.get("bar"), "a, b, c");
  t.deepEqual(headers.getAll("bar"), ["a, b, c"]);
  t.deepEqual(headers.toJSON(), {
    bar: "a, b, c",
  });
});

test("set cookie header", (t) => {
  const headers = new HttpHeaders()
    .set("Cookie", "a=1")
    .set("cookie", "b=2")
    .set("COOKIE", "c=3");

  t.true(headers.has("cookie"));
  t.is(headers.get("cookie"), "c=3");
  t.deepEqual(headers.getAll("cookie"), ["c=3"]);
  t.deepEqual(headers.toJSON(), {
    Cookie: "c=3",
  });
});

test("append cookie header", (t) => {
  const headers = new HttpHeaders()
    .append("Cookie", "a=1")
    .append("cookie", "b=2")
    .append("COOKIE", "c=3");

  t.true(headers.has("cookie"));
  t.is(headers.get("cookie"), "a=1; b=2; c=3");
  t.deepEqual(headers.getAll("cookie"), ["a=1; b=2; c=3"]);
  t.deepEqual(headers.toJSON(), {
    Cookie: "a=1; b=2; c=3",
  });
});

test("set set-cookie header", (t) => {
  const headers = new HttpHeaders()
    .set("Set-Cookie", "a=1")
    .set("set-cookie", "b=2")
    .set("SET-COOKIE", "c=3");

  t.true(headers.has("set-cookie"));
  t.is(headers.get("set-cookie"), "c=3");
  t.deepEqual(headers.getAll("set-cookie"), ["c=3"]);
  t.deepEqual(headers.toJSON(), {
    "Set-Cookie": ["c=3"],
  });
});

test("append set-cookie header", (t) => {
  const headers = new HttpHeaders()
    .append("Set-Cookie", "a=1")
    .append("set-cookie", "b=2")
    .append("SET-COOKIE", "c=3");

  t.true(headers.has("set-cookie"));
  t.is(headers.get("set-cookie"), "a=1");
  t.deepEqual(headers.getAll("set-cookie"), ["a=1", "b=2", "c=3"]);
  t.deepEqual(headers.toJSON(), {
    "Set-Cookie": ["a=1", "b=2", "c=3"],
  });
});

test("delete header", (t) => {
  const headers = new HttpHeaders()
    .set("foo", "1")
    .set("cookie", "a=1")
    .set("set-cookie", "a=1");

  t.true(headers.has("foo"));
  t.true(headers.has("cookie"));
  t.true(headers.has("set-cookie"));

  headers.delete("foo");
  headers.delete("cookie");
  headers.delete("set-cookie");

  t.false(headers.has("foo"));
  t.is(headers.get("foo"), null);
  t.deepEqual(headers.getAll("foo"), []);

  t.false(headers.has("cookie"));
  t.is(headers.get("cookie"), null);
  t.deepEqual(headers.getAll("cookie"), []);

  t.false(headers.has("set-cookie"));
  t.is(headers.get("set-cookie"), null);
  t.deepEqual(headers.getAll("set-cookie"), []);
});

test("new instance from headers", (t) => {
  const headers = new HttpHeaders(
    new HttpHeaders().set("foo", "1").set("bar", "2"),
  );
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("new instance from map", (t) => {
  const headers = new HttpHeaders(
    new Map([
      ["foo", 1],
      ["bar", 2],
    ]),
  );
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("new instance from record", (t) => {
  const headers = new HttpHeaders({
    foo: 1,
    bar: 2,
  });
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("new instance from entries", (t) => {
  const headers = new HttpHeaders([
    ["foo", 1],
    ["bar", 2],
  ]);
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("spread", (t) => {
  const headers = new HttpHeaders().set("foo", "a").append("bar", "b");
  t.deepEqual({ ...headers }, {});
  t.deepEqual(
    [...headers],
    [
      ["foo", "a"],
      ["bar", "b"],
    ],
  );
  t.deepEqual(Object.fromEntries(headers), {
    foo: "a",
    bar: "b",
  });
});

test("toJSON", (t) => {
  const headers = new HttpHeaders()
    .append("foo", 1)
    .append("foo", 2)
    .append("bar", 3)
    .append("Cookie", "a=1")
    .append("Cookie", "b=2")
    .append("Set-Cookie", "c=3")
    .append("Set-Cookie", "d=4");

  t.deepEqual(headers.toJSON(), {
    "foo": "1, 2",
    "bar": "3",
    "Cookie": "a=1; b=2",
    "Set-Cookie": ["c=3", "d=4"],
  });
});

test("toString", (t) => {
  const headers = new HttpHeaders()
    .append("foo", 1)
    .append("foo", 2)
    .append("bar", 3)
    .append("Cookie", "a=1")
    .append("Cookie", "b=2")
    .append("Set-Cookie", "c=3")
    .append("Set-Cookie", "d=4");

  t.is(
    headers.toString(),
    "foo: 1, 2\n" +
      "bar: 3\n" +
      "Cookie: a=1; b=2\n" +
      "Set-Cookie: c=3\n" +
      "Set-Cookie: d=4\n",
  );
});

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
    },
  );
  t.throws(
    () => {
      headers.append("\0", "something");
    },
    {
      instanceOf: TypeError,
    },
  );
  t.throws(
    () => {
      headers.delete("\0");
    },
    {
      instanceOf: TypeError,
    },
  );
  t.throws(
    () => {
      headers.has("\0");
    },
    {
      instanceOf: TypeError,
    },
  );
  t.throws(
    () => {
      headers.get("\0");
    },
    {
      instanceOf: TypeError,
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
    },
  );
  t.throws(
    () => {
      headers.append("header", "\0");
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("get missing header", (t) => {
  const headers = new HttpHeaders();

  t.false(headers.has("foo"));
  t.is(headers.get("foo"), null);
});

test("set simple header", (t) => {
  const headers = new HttpHeaders()
    .set("foo", "a")
    .set("Foo", "b")
    .set("FOO", "c");

  t.true(headers.has("foo"));
  t.is(headers.get("foo"), "c");
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
  t.deepEqual(headers.toJSON(), {
    bar: "a, b, c",
  });
});

test("delete header", (t) => {
  const headers = new HttpHeaders().set("foo", "1");

  t.true(headers.has("foo"));

  headers.delete("foo");

  t.false(headers.has("foo"));
  t.is(headers.get("foo"), null);
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
    .append("bar", 3);

  t.deepEqual(headers.toJSON(), {
    foo: "1, 2",
    bar: "3",
  });
});

test("toString", (t) => {
  const headers = new HttpHeaders()
    .append("foo", 1)
    .append("foo", 2)
    .append("bar", 3);

  t.is(headers.toString(), "foo: 1, 2\nbar: 3\n");
});

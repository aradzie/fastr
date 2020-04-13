import test from "ava";
import { Cookie } from "./cookie";
import { Headers } from "./headers";
import { SetCookie } from "./set-cookie";

test("mutate", (t) => {
  const headers = new Headers()
    .set("foo", "a")
    .set("Foo", "b")
    .set("FOO", "c")
    .append("bar", "a")
    .append("Bar", "b")
    .append("BAR", "c");

  t.is(headers.get("foo"), "c");
  t.deepEqual(headers.getAll("foo"), ["c"]);
  t.is(headers.get("bar"), "a, b, c");
  t.deepEqual(headers.getAll("bar"), ["a, b, c"]);
  t.false(headers.has("baz"));
  t.is(headers.get("baz"), null);
  t.deepEqual(headers.getAll("baz"), []);
});

test("from headers", (t) => {
  const headers = new Headers(new Headers().set("foo", "1").set("bar", "2"));
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("from map", (t) => {
  const headers = new Headers(
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

test("from record", (t) => {
  const headers = new Headers({
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

test("from entries", (t) => {
  const headers = new Headers([
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
  const headers = new Headers().set("foo", "a").append("bar", "b");
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
  const headers = new Headers()
    .append("foo", 1)
    .append("foo", 2)
    .set("bar", 3)
    .set("Cookie", Cookie.parse("a=1; b=2"))
    .append("Set-Cookie", SetCookie.parse("c=3"))
    .append("Set-Cookie", SetCookie.parse("d=4"));

  t.deepEqual(headers.toJSON(), {
    "foo": "1, 2",
    "bar": "3",
    "Cookie": "a=1; b=2",
    "Set-Cookie": ["c=3", "d=4"],
  });
});

test("toString", (t) => {
  const headers = new Headers()
    .append("foo", 1)
    .append("foo", 2)
    .set("bar", 3)
    .set("Cookie", Cookie.parse("a=1; b=2"))
    .append("Set-Cookie", SetCookie.parse("c=3"))
    .append("Set-Cookie", SetCookie.parse("d=4"));

  t.is(
    headers.toString(),
    "foo: 1, 2\n" +
      "bar: 3\n" +
      "Cookie: a=1; b=2\n" +
      "Set-Cookie: c=3\n" +
      "Set-Cookie: d=4\n",
  );
});

test("parse", (t) => {
  t.deepEqual(Headers.parse("").toJSON(), {});
  t.deepEqual(Headers.parse("\n").toJSON(), {});
  t.deepEqual(Headers.parse("foo: a").toJSON(), {
    foo: "a",
  });
  t.deepEqual(Headers.parse("foo: a\n").toJSON(), {
    foo: "a",
  });
  t.deepEqual(Headers.parse("foo: a\nbar: b:c=d").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(Headers.parse("\nfoo:  a  \nbar:b:c=d  \n\n").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(
    Headers.parse(
      "Date: Thu, 01 Jan 1970 00:00:01 GMT\n" +
        "Accept: image/png\n" +
        "Accept: image/*\n" +
        "Cache-Control: no-cache\n" +
        "Cache-Control: no-store\n" +
        "Cookie: a=1; b=2\n" +
        "Set-Cookie: c=3\n" +
        "Set-Cookie: d=4\n",
    ).toJSON(),
    {
      "Date": "Thu, 01 Jan 1970 00:00:01 GMT",
      "Accept": "image/png, image/*",
      "Cache-Control": "no-cache, no-store",
      "Cookie": "a=1; b=2",
      "Set-Cookie": ["c=3", "d=4"],
    },
  );
});

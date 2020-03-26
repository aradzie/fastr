import { type GetHeader } from "@fastr/headers";
import test from "ava";
import { Readable } from "stream";
import { Payload } from "./payload.js";
import { Streamable } from "./streamable.js";

test("string body", (t) => {
  const body = "text";
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "text/plain; charset=UTF-8",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar", 100)), //
    {
      type: "foo/bar; charset=UTF-8",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;a=b", 100)), //
    {
      type: "foo/bar; a=b; charset=UTF-8",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;charset=utf8;a=b", 100)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      length: 4,
      body,
    },
  );
  t.throws(
    () => {
      new Payload(body, headers("foo/bar;charset=ASCII", 100)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("Buffer body", (t) => {
  const body = Buffer.from("body");
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "application/octet-stream",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar", 100)), //
    {
      type: "foo/bar",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;charset=utf8;a=b", 100)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      length: 4,
      body,
    },
  );
  t.like(
    new Payload(body, headers("text/plain", 100)), //
    {
      type: "text/plain; charset=UTF-8",
      length: 4,
      body,
    },
  );
  t.throws(
    () => {
      new Payload(body, headers("text/plain;charset=ASCII", null)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("ArrayBufferView body", (t) => {
  const body = new Uint8Array(Buffer.from("body"));
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "application/octet-stream",
      length: 4,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar", 100)), //
    {
      type: "foo/bar",
      length: 4,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;charset=utf8;a=b", 100)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      length: 4,
    },
  );
  t.like(
    new Payload(body, headers("text/plain", 100)), //
    {
      type: "text/plain; charset=UTF-8",
      length: 4,
    },
  );
  t.throws(
    () => {
      new Payload(body, headers("text/plain;charset=ASCII", null)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("Readable body", (t) => {
  const body = Readable.from(["body"]);
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "application/octet-stream",
      length: null,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar", 123)), //
    {
      type: "foo/bar",
      length: 123,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;charset=utf8;a=b", 123)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      length: 123,
      body,
    },
  );
  t.like(
    new Payload(body, headers("text/plain", 123)), //
    {
      type: "text/plain; charset=UTF-8",
      length: 123,
      body,
    },
  );
  t.throws(
    () => {
      new Payload(body, headers("text/plain;charset=ASCII", null)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("Streamable body", (t) => {
  const body = new (class extends Streamable {
    override length(): number | null {
      return 456;
    }

    override open(): Readable {
      return Readable.from([]);
    }
  })();
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "application/octet-stream",
      length: 456,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar", 123)), //
    {
      type: "foo/bar",
      length: 456,
      body,
    },
  );
  t.like(
    new Payload(body, headers("foo/bar;charset=utf8;a=b", 123)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      length: 456,
      body,
    },
  );
  t.like(
    new Payload(body, headers("text/plain", 123)), //
    {
      type: "text/plain; charset=UTF-8",
      length: 456,
      body,
    },
  );
  t.throws(
    () => {
      new Payload(body, headers("text/plain;charset=ASCII", null)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("URLSearchParams body", (t) => {
  const body = new URLSearchParams([["a", "1"]]);
  t.like(
    new Payload(body, headers(null, null)), //
    {
      type: "application/x-www-form-urlencoded; charset=UTF-8",
      length: 3,
      body: "a=1",
    },
  );
  t.like(
    new Payload(body, headers("application/x-www-form-urlencoded", 123)), //
    {
      type: "application/x-www-form-urlencoded; charset=UTF-8",
      length: 3,
      body: "a=1",
    },
  );
});

test("object body", (t) => {
  const plainObject = { a: 1 };
  const nonPlainObject = new (class Dummy {
    ignored = 0;
    get [Symbol.toStringTag](): string {
      return "Dummy";
    }
    toJSON(): unknown {
      return plainObject;
    }
  })();

  t.like(
    new Payload(plainObject, headers(null, null)), //
    {
      type: "application/json; charset=UTF-8",
      body: '{"a":1}',
      length: 7,
    },
  );
  t.like(
    new Payload(nonPlainObject, headers(null, null)), //
    {
      type: "application/json; charset=UTF-8",
      body: '{"a":1}',
      length: 7,
    },
  );
  t.like(
    new Payload([plainObject, nonPlainObject], headers(null, null)), //
    {
      type: "application/json; charset=UTF-8",
      body: '[{"a":1},{"a":1}]',
      length: 17,
    },
  );

  t.like(
    new Payload(plainObject, headers("foo/bar", null)), //
    {
      type: "foo/bar; charset=UTF-8",
      body: '{"a":1}',
      length: 7,
    },
  );
  t.like(
    new Payload(plainObject, headers("foo/bar;a=b", null)), //
    {
      type: "foo/bar; a=b; charset=UTF-8",
      body: '{"a":1}',
      length: 7,
    },
  );
  t.like(
    new Payload(plainObject, headers("foo/bar;charset=UTF-8;a=b", null)), //
    {
      type: "foo/bar; charset=UTF-8; a=b",
      body: '{"a":1}',
      length: 7,
    },
  );
  t.throws(
    () => {
      new Payload(plainObject, headers("foo/bar;charset=ASCII", null)); //
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("reject invalid type", (t) => {
  // Try function.
  t.throws(
    () => {
      new Payload(() => null, headers(null, null));
    },
    {
      instanceOf: TypeError,
      message: "Invalid body type [object Function]",
    },
  );

  // Try non-plain object.
  t.throws(
    () => {
      new Payload(
        new (class Dummy {
          get [Symbol.toStringTag](): string {
            return "Dummy";
          }
        })(),
        headers(null, null),
      );
    },
    {
      instanceOf: TypeError,
      message: "Invalid body type [object Dummy]",
    },
  );

  // Try Map.
  t.throws(
    () => {
      new Payload(new Map(), headers(null, null));
    },
    {
      instanceOf: TypeError,
      message: "Invalid body type [object Map]",
    },
  );
});

test("read stream", async (t) => {
  t.is(
    (
      await new Payload(
        Readable.from(["a", "b", "c"]),
        headers(null, null),
      ).readStream()
    ).toString("utf8"),
    "abc",
  );
  t.is(
    (
      await new Payload(
        Readable.from([Buffer.from("a"), Buffer.from("b"), Buffer.from("c")]),
        headers(null, null),
      ).readStream()
    ).toString("utf8"),
    "abc",
  );
});

function headers(type: string | null, length: number | null): GetHeader {
  return {
    get(name: string): string | null {
      switch (name.toLowerCase()) {
        case "content-type":
          return type;
        case "content-length":
          return length != null ? String(length) : null;
        default:
          return null;
      }
    },
  };
}

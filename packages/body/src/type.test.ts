import test from "ava";
import { Readable } from "stream";
import { Streamable } from "./streamable.js";
import { guessContentType } from "./type.js";

test("guess text type", (t) => {
  const body = "text";
  t.deepEqual(
    guessContentType(body, null), //
    [body, "text/plain; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar"), //
    [body, "foo/bar; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar;a=b"), //
    [body, "foo/bar; a=b; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar;charset=UTF-8;a=b"), //
    [body, "foo/bar; charset=UTF-8; a=b"],
  );
  t.throws(
    () => {
      guessContentType(body, "foo/bar;charset=ASCII"); //
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess buffer type", (t) => {
  const body = Buffer.alloc(0);
  t.deepEqual(
    guessContentType(body, null), //
    [body, "application/octet-stream"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar"), //
    [body, "foo/bar"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar;charset=ASCII-8;a=b"), //
    [body, "foo/bar; a=b"],
  );
  t.deepEqual(
    guessContentType(body, "text/plain"), //
    [body, "text/plain; charset=UTF-8"],
  );
  t.throws(
    () => {
      guessContentType(body, "text/plain;charset=ASCII"); //
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess readable type", (t) => {
  const body = Readable.from([]);
  t.deepEqual(
    guessContentType(body, null), //
    [body, "application/octet-stream"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar"), //
    [body, "foo/bar"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar;charset=ASCII-8;a=b"), //
    [body, "foo/bar; a=b"],
  );
  t.deepEqual(
    guessContentType(body, "text/plain"), //
    [body, "text/plain; charset=UTF-8"],
  );
  t.throws(
    () => {
      guessContentType(body, "text/plain;charset=ASCII"); //
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess streamable type", (t) => {
  const body = new (class extends Streamable {
    override length(): number | null {
      return 0;
    }

    override open(): Readable {
      return Readable.from([]);
    }
  })();
  t.deepEqual(
    guessContentType(body, null), //
    [body, "application/octet-stream"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar"), //
    [body, "foo/bar"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar;charset=ASCII-8;a=b"), //
    [body, "foo/bar; a=b"],
  );
  t.deepEqual(
    guessContentType(body, "text/plain"), //
    [body, "text/plain; charset=UTF-8"],
  );
  t.throws(
    () => {
      guessContentType(body, "text/plain;charset=ASCII"); //
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess form type", (t) => {
  const body = new URLSearchParams([["a", "1"]]);
  t.deepEqual(
    guessContentType(body, null), //
    ["a=1", "application/x-www-form-urlencoded; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(body, "application/x-www-form-urlencoded"), //
    ["a=1", "application/x-www-form-urlencoded; charset=UTF-8"],
  );
});

test("guess json type", (t) => {
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

  t.deepEqual(guessContentType(plainObject, null), [
    '{"a":1}',
    "application/json; charset=UTF-8",
  ]);
  t.deepEqual(guessContentType(nonPlainObject, null), [
    '{"a":1}',
    "application/json; charset=UTF-8",
  ]);
  t.deepEqual(guessContentType([plainObject, nonPlainObject], null), [
    '[{"a":1},{"a":1}]',
    "application/json; charset=UTF-8",
  ]);

  t.deepEqual(
    guessContentType(plainObject, "foo/bar"), //
    ['{"a":1}', "foo/bar; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(plainObject, "foo/bar;a=b"), //
    ['{"a":1}', "foo/bar; a=b; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(plainObject, "foo/bar;charset=UTF-8;a=b"), //
    ['{"a":1}', "foo/bar; charset=UTF-8; a=b"],
  );
  t.throws(
    () => {
      guessContentType(plainObject, "foo/bar;charset=ASCII"); //
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("reject invalid type", (t) => {
  // Try function.
  t.throws(
    () => {
      guessContentType(() => null, null);
    },
    {
      instanceOf: TypeError,
      message: "Invalid body type [object Function]",
    },
  );

  // Try non-plain object.
  t.throws(
    () => {
      guessContentType(
        new (class Dummy {
          get [Symbol.toStringTag](): string {
            return "Dummy";
          }
        })(),
        null,
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
      guessContentType(new Map(), null);
    },
    {
      instanceOf: TypeError,
      message: "Invalid body type [object Map]",
    },
  );
});

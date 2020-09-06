import test from "ava";
import { Readable } from "stream";
import { URLSearchParams } from "url";
import { Streamable } from "./streamable";
import { guessContentType } from "./type";

test("guess text type", (t) => {
  const body = "text";
  t.deepEqual(
    guessContentType(body, null), //
    [body, "text/plain; charset=UTF-8"],
  );
  t.deepEqual(
    guessContentType(body, "foo/bar"), //
    [body, "foo/bar"],
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
});

test("guess streamable type", (t) => {
  const body = new (class extends Streamable {
    length(): number | null {
      return 0;
    }

    open(): Readable {
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
});

test("guess form type", (t) => {
  const body = new URLSearchParams([["a", "1"]]);
  t.deepEqual(
    guessContentType(body, null), //
    ["a=1", "application/x-www-form-urlencoded; charset=UTF-8"],
  );
});

test("guess json type", (t) => {
  const plainObject = { a: 1 };
  const nonPlainObject = new (class Dummy {
    ignored = 0;

    toJSON(): unknown {
      return plainObject;
    }
  })();

  // Try plain object.
  t.deepEqual(guessContentType(plainObject, null), [
    '{"a":1}',
    "application/json; charset=UTF-8",
  ]);

  // Try plain object with custom type.
  t.deepEqual(guessContentType(plainObject, "application/foobar+json"), [
    '{"a":1}',
    "application/foobar+json",
  ]);

  // Try non-plain object with the toJSON method.
  t.deepEqual(guessContentType(nonPlainObject, null), [
    '{"a":1}',
    "application/json; charset=UTF-8",
  ]);

  // Try non-plain object with the toJSON method with custom type.
  t.deepEqual(guessContentType(nonPlainObject, "application/foobar+json"), [
    '{"a":1}',
    "application/foobar+json",
  ]);

  // Try array.
  t.deepEqual(guessContentType([plainObject], null), [
    '[{"a":1}]',
    "application/json; charset=UTF-8",
  ]);

  // Try array with custom type.
  t.deepEqual(guessContentType([plainObject], "application/foobar+json"), [
    '[{"a":1}]',
    "application/foobar+json",
  ]);
});

test("reject invalid type", (t) => {
  // Try function.
  t.throws(
    () => {
      guessContentType(() => null, null);
    },
    {
      instanceOf: TypeError,
    },
  );

  // Try non-plain object.
  t.throws(
    () => {
      guessContentType(new (class Dummy {})(), null);
    },
    {
      instanceOf: TypeError,
    },
  );

  // Try Map.
  t.throws(
    () => {
      guessContentType(new Map(), null);
    },
    {
      instanceOf: TypeError,
    },
  );
});

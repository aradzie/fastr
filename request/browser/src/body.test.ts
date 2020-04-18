import test from "ava";
import { guessContentType, toFormData } from "./body";

test("use custom type", (t) => {
  t.is(guessContentType("text", "foo/bar")[1], "foo/bar");
});

test("guess text type", (t) => {
  t.is(guessContentType("text", null)[1], "text/plain");
});

test("guess multipart form type", (t) => {
  t.is(guessContentType(new FormData(), null)[1], "multipart/form-data");
});

test("guess url-encoded form type", (t) => {
  t.is(
    guessContentType(new URLSearchParams(), null)[1],
    "application/x-www-form-urlencoded",
  );
});

test("guess type from blob", (t) => {
  t.is(guessContentType(new Blob([]), null)[1], "application/octet-stream");
  t.is(
    guessContentType(new Blob([], { type: "text/plain" }), null)[1],
    "text/plain",
  );
});

test("guess array buffer type", (t) => {
  t.is(
    guessContentType(new ArrayBuffer(0), null)[1],
    "application/octet-stream",
  );
});

test("guess array buffer view type", (t) => {
  t.is(
    guessContentType(new Uint8Array(0), null)[1],
    "application/octet-stream",
  );
});

test("guess json type", (t) => {
  // Try plain object.
  t.deepEqual(guessContentType({ a: 1 }, null), [
    '{"a":1}',
    "application/json",
  ]);

  // Try non-plain object with the toJSON method.
  t.deepEqual(
    guessContentType(
      new (class Dummy {
        ignored = 0;
        toJSON(): unknown {
          return { a: 1 };
        }
      })(),
      null,
    ),
    ['{"a":1}', "application/json"],
  );
});

test("reject invalid type", (t) => {
  // Try array.
  t.throws(
    () => {
      guessContentType([], null);
    },
    {
      instanceOf: TypeError,
    },
  );

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
});

test("to form data", (t) => {
  t.is(toFormData(new FormData())[1], "multipart/form-data");
  t.is(
    toFormData(new URLSearchParams())[1],
    "application/x-www-form-urlencoded",
  );
  t.is(toFormData(new Map())[1], "application/x-www-form-urlencoded");
  t.is(toFormData({})[1], "application/x-www-form-urlencoded");
  t.is(toFormData([])[1], "application/x-www-form-urlencoded");
});

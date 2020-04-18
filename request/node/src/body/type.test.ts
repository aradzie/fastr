import test from "ava";
import { guessContentType } from "./type";

test("use custom type", (t) => {
  t.is(guessContentType("text", "foo/bar")[1], "foo/bar");
});

test("guess text type", (t) => {
  t.is(guessContentType("text", null)[1], "text/plain");
});

test("guess buffer type", (t) => {
  t.is(guessContentType(Buffer.alloc(0), null)[1], "application/octet-stream");
});

test("guess form type", (t) => {
  t.is(
    guessContentType(new URLSearchParams(), null)[1],
    "application/x-www-form-urlencoded",
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

import test from "ava";
import { guessContentType, toFormData } from "./type";

test("guess text type", (t) => {
  const body = "text";
  t.deepEqual(guessContentType(body, null), [body, null]);
  t.deepEqual(guessContentType(body, "foo/bar"), [body, "foo/bar"]);
});

test("guess multipart form type", (t) => {
  const body = new FormData();
  t.deepEqual(guessContentType(body, null), [body, null]);
  t.throws(
    () => {
      guessContentType(body, "foo/bar");
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess url-encoded form type", (t) => {
  const body = new URLSearchParams();
  t.deepEqual(guessContentType(body, null), [body, null]);
  t.throws(
    () => {
      guessContentType(body, "foo/bar");
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("guess type from blob", (t) => {
  const body = new Blob([]);
  t.deepEqual(guessContentType(body, null), [body, "application/octet-stream"]);
  t.deepEqual(guessContentType(body, "foo/bar"), [body, "foo/bar"]);
});

test("guess type from blob with type", (t) => {
  const body = new Blob([], { type: "bar/baz" });
  t.deepEqual(guessContentType(body, null), [body, "bar/baz"]);
  t.deepEqual(guessContentType(body, "foo/bar"), [body, "foo/bar"]);
});

test("guess array buffer type", (t) => {
  const body = new ArrayBuffer(0);
  t.false(ArrayBuffer.isView(body));
  t.deepEqual(guessContentType(body, null), [body, "application/octet-stream"]);
  t.deepEqual(guessContentType(body, "foo/bar"), [body, "foo/bar"]);
});

test("guess array buffer view type", (t) => {
  const body = new Uint8Array(0);
  t.true(ArrayBuffer.isView(body));
  t.deepEqual(guessContentType(body, null), [body, "application/octet-stream"]);
  t.deepEqual(guessContentType(body, "foo/bar"), [body, "foo/bar"]);
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
    "application/json",
  ]);

  // Try plain object with custom type.
  t.deepEqual(guessContentType(plainObject, "application/foobar+json"), [
    '{"a":1}',
    "application/foobar+json",
  ]);

  // Try non-plain object with the toJSON method.
  t.deepEqual(guessContentType(nonPlainObject, null), [
    '{"a":1}',
    "application/json",
  ]);

  // Try non-plain object with the toJSON method with custom type.
  t.deepEqual(guessContentType(nonPlainObject, "application/foobar+json"), [
    '{"a":1}',
    "application/foobar+json",
  ]);

  // Try array.
  t.deepEqual(guessContentType([plainObject], null), [
    '[{"a":1}]',
    "application/json",
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

test("to form data", (t) => {
  const formData = new FormData();
  const urlSearchParams = new URLSearchParams();
  t.is(toFormData(formData), formData);
  t.is(toFormData(urlSearchParams), urlSearchParams);
  t.true(toFormData(new Map()) instanceof URLSearchParams);
  t.true(toFormData({}) instanceof URLSearchParams);
  t.true(toFormData([]) instanceof URLSearchParams);
});

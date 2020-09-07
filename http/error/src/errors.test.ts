import test from "ava";
import { types } from "util";
import { BadRequestError, createError, HttpError } from "./errors.js";

test("create error returns an http error constructor", (t) => {
  const ctor = createError(400);

  t.is(typeof ctor, "function");

  const instance = new ctor();

  t.true(types.isNativeError(instance));
  t.true(instance instanceof HttpError);
  t.is(instance.name, "HttpError [400]");
  t.is(instance.message, "Bad Request");
  t.is(instance.status, 400);
  t.is(String(instance), "HttpError [400]: Bad Request");
  t.is(Object.prototype.toString.call(instance), "[object HttpError]");
});

test("create error uses cache", (t) => {
  const a = createError(400);
  const b = createError(400);

  t.is(BadRequestError, a);
  t.is(BadRequestError, b);
  t.is(a, b);
  t.true(new a() instanceof BadRequestError);
  t.true(new b() instanceof BadRequestError);
});

test("exposes only client errors", (t) => {
  t.true(new (createError(400))().expose);
  t.false(new (createError(500))().expose);
});

test("uses custom error message", (t) => {
  t.is(new (createError(400))("OMG").message, "OMG");
  t.is(new (createError(500))("OMG").message, "OMG");
});

test("accepts only valid HTTP error status codes", (t) => {
  t.throws(
    () => {
      new HttpError(100);
    },
    {
      instanceOf: TypeError,
      message: "Invalid HTTP error status code 100.",
    },
  );
  t.throws(
    () => {
      createError(100);
    },
    {
      instanceOf: TypeError,
      message: "Invalid HTTP error status code 100.",
    },
  );
});

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
  t.deepEqual({ ...instance }, {});
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

test("uses custom error message", (t) => {
  t.is(new (createError(400))("OMG").message, "OMG");
  t.is(new (createError(500))("OMG").message, "OMG");
});

test("exposes only client errors", (t) => {
  t.true(new (createError(400))().expose);
  t.false(new (createError(500))().expose);
});

test("respects error option `expose`", (t) => {
  t.true(new (createError(400))("400", { expose: true }).expose);
  t.false(new (createError(400))("400", { expose: false }).expose);
  t.true(new (createError(500))("500", { expose: true }).expose);
  t.false(new (createError(500))("500", { expose: false }).expose);
});

test("respects error options", (t) => {
  const ctor = createError(400);
  const inst = new ctor("OMG", {
    description: "This is wrong",
    cause: new TypeError("Cause"),
  });
  t.is(inst.status, 400);
  t.is(inst.message, "OMG");
  t.is(inst.description, "This is wrong");
  t.is((inst.cause as Error).message, "Cause");
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

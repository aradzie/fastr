import test from "ava";
import { createError } from "./errors.js";

test("create error with default options", (t) => {
  const ctor = createError("OMG", "What a terrible failure.");

  t.true(typeof ctor === "function");

  const instance = new ctor();

  t.true(instance instanceof TypeError);
  t.is(instance.name, "HeaderError [OMG]");
  t.is(instance.message, "OMG: What a terrible failure.");
  t.is(instance.code, "OMG");
  t.is(instance.status, 500);
  t.deepEqual({ ...instance }, {});
  t.is(String(instance), "HeaderError [OMG]: OMG: What a terrible failure.");
  t.is(Object.prototype.toString.call(instance), "[object HeaderError]");
});

test("create error with custom options", (t) => {
  const ctor = createError("OMG", "What a terrible failure.", 400, SyntaxError);

  t.true(typeof ctor === "function");

  const instance = new ctor();

  t.true(instance instanceof SyntaxError);
  t.is(instance.name, "HeaderError [OMG]");
  t.is(instance.message, "OMG: What a terrible failure.");
  t.is(instance.code, "OMG");
  t.is(instance.status, 400);
  t.deepEqual({ ...instance }, {});
  t.is(String(instance), "HeaderError [OMG]: OMG: What a terrible failure.");
  t.is(Object.prototype.toString.call(instance), "[object HeaderError]");
});

test("standard error", (t) => {
  const instance = new Error("OMG");

  t.is(instance.name, "Error");
  t.is(instance.message, "OMG");
  t.deepEqual({ ...instance }, {});
  t.is(String(instance), "Error: OMG");
  t.is(Object.prototype.toString.call(instance), "[object Error]");
});

import test from "ava";
import { ApplicationError } from "./applicationerror";

test("construct with default values", (t) => {
  const ex = new ApplicationError("error message");

  t.true(ex instanceof ApplicationError);
  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 200);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
    },
  });
});

test("construct with custom status", (t) => {
  const ex = new ApplicationError("error message", {
    status: 500,
  });

  t.true(ex instanceof ApplicationError);
  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 500);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
    },
  });
});

test("construct with custom body", (t) => {
  const ex = new ApplicationError("error message", {
    body: {
      error: {
        message: "error message",
        type: "validation error",
      },
    },
  });

  t.true(ex instanceof ApplicationError);
  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 200);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
      type: "validation error",
    },
  });
});

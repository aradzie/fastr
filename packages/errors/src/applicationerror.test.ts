import test from "ava";
import { ApplicationError } from "./applicationerror.js";

test("construct with default values", (t) => {
  const ex = new ApplicationError("error message");

  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 200);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
    },
  });
  t.deepEqual(ex.toJSON(), {
    error: {
      message: "error message",
    },
  });
  t.deepEqual(ApplicationError.fromErrorBody(ex.toJSON()), ex);
});

test("construct with custom status", (t) => {
  const ex = new ApplicationError("error message", {
    status: 500,
  });

  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 500);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
    },
  });
  t.deepEqual(ex.toJSON(), {
    error: {
      message: "error message",
    },
  });
  t.deepEqual(ApplicationError.fromErrorBody(ex.toJSON()), ex);
});

test("construct with custom body", (t) => {
  const ex = new ApplicationError("error message", {
    body: {
      error: {
        message: "error message",
        type: "validation_error",
      },
    },
  });

  t.is(ex.name, "ApplicationError");
  t.is(ex.message, "error message");
  t.is(ex.status, 200);
  t.deepEqual(ex.body, {
    error: {
      message: "error message",
      type: "validation_error",
    },
  });
  t.deepEqual(ex.toJSON(), {
    error: {
      message: "error message",
      type: "validation_error",
    },
  });
  t.deepEqual(ApplicationError.fromErrorBody(ex.toJSON()), ex);
});

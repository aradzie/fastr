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

test("is error body", (t) => {
  t.false(ApplicationError.isErrorBody(undefined));
  t.false(ApplicationError.isErrorBody(null));
  t.false(ApplicationError.isErrorBody(0));
  t.false(ApplicationError.isErrorBody(""));
  t.false(ApplicationError.isErrorBody([]));
  t.false(ApplicationError.isErrorBody({}));
  t.false(ApplicationError.isErrorBody({ error: null }));
  t.false(ApplicationError.isErrorBody({ error: {} }));
  t.false(ApplicationError.isErrorBody({ error: { message: null } }));
  t.true(ApplicationError.isErrorBody({ error: { message: "omg" } }));
  t.true(
    ApplicationError.isErrorBody({
      error: { message: "omg", type: "validation_error" },
    }),
  );
  t.deepEqual(
    ApplicationError.fromErrorBody({
      error: { message: "omg", type: "validation_error" },
    })?.toJSON(),
    { error: { message: "omg", type: "validation_error" } },
  );
});

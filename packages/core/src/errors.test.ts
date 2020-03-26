import { InternalServerError, NotFoundError } from "@fastr/errors";
import test from "ava";
import { inspectError } from "./errors.js";

test("inspect runtime errors", (t) => {
  t.deepEqual(inspectError(new TypeError()), {
    name: "TypeError",
    message: "",
    status: 500,
    expose: false,
  });
  t.deepEqual(inspectError(new TypeError("boom")), {
    name: "TypeError",
    message: "boom",
    status: 500,
    expose: false,
  });
});

test("inspect http errors", (t) => {
  t.deepEqual(inspectError(new NotFoundError()), {
    name: "HttpError [404]",
    message: "Not Found",
    status: 404,
    expose: true,
  });
  t.deepEqual(inspectError(new NotFoundError("boom")), {
    name: "HttpError [404]",
    message: "boom",
    status: 404,
    expose: true,
  });
  t.deepEqual(inspectError(new InternalServerError()), {
    name: "HttpError [500]",
    message: "Internal Server Error",
    status: 500,
    expose: false,
  });
  t.deepEqual(inspectError(new InternalServerError("boom")), {
    name: "HttpError [500]",
    message: "boom",
    status: 500,
    expose: false,
  });
});

test("inspect non-errors", (t) => {
  t.deepEqual(inspectError(null), {
    name: "Error",
    message: "null",
    status: 500,
    expose: false,
  });
  t.deepEqual(inspectError("boom"), {
    name: "Error",
    message: "boom",
    status: 500,
    expose: false,
  });
});

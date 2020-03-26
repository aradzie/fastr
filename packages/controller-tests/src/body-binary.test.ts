import { body, controller, http, type Pipe } from "@fastr/controller";
import { BadRequestError } from "@fastr/errors";
import { injectable } from "@fastr/invert";
import test from "ava";
import { helper } from "./helper.js";

const expect = (body: string): Pipe => {
  return (ctx, value) => {
    if (!Buffer.isBuffer(value) || value.toString("utf8") !== body) {
      throw new BadRequestError("Invalid Body");
    }
    return value;
  };
};

@injectable()
@controller()
class Controller1 {
  @http.POST("/body")
  body(@body.binary(expect("binary body")) value: Buffer) {
    return `body=${format(value.toString("utf8"))}`;
  }
}

test("process body", async (t) => {
  // Arrange.

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req //
    .POST("/body")
    .send(Buffer.from("binary body"));

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.is(await res.body.text(), "body=[binary body]");
});

test("check media type", async (t) => {
  // Arrange.

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req //
    .POST("/body")
    .type("foo/bar")
    .send("omg");

  // Assert.

  t.like(res, {
    status: 415,
    statusText: "Unsupported Media Type",
  });
  t.is(await res.body.text(), "HttpError [415]: Unsupported Media Type");
});

test("validation error", async (t) => {
  // Arrange.

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req //
    .POST("/body")
    .send(Buffer.from("omg"));

  // Assert.

  t.like(res, {
    status: 400,
    statusText: "Bad Request",
  });
  t.is(await res.body.text(), "HttpError [400]: Invalid Body");
});

function format(value: string | null | undefined): string {
  if (value == null) {
    return `null`;
  } else {
    return `[${value}]`;
  }
}

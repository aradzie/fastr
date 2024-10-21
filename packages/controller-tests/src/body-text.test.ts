import { body, controller, http, type Pipe } from "@fastr/controller";
import { BadRequestError } from "@fastr/errors";
import { injectable } from "@fastr/invert";
import test, { registerCompletionHandler } from "ava";
import { z, type ZodSchema } from "zod";
import { helper } from "./helper.js";

registerCompletionHandler(() => {
  process.exit();
});

const check = (schema: ZodSchema): Pipe => {
  return (ctx, value) => {
    try {
      return schema.parse(value);
    } catch (err) {
      throw new BadRequestError("Invalid Body", { cause: err });
    }
  };
};

@injectable()
@controller()
class Controller1 {
  @http.POST("/body")
  body(@body.text(check(z.string().includes("text body"))) value: string) {
    return `body=${format(value)}`;
  }
}

test("process body", async (t) => {
  // Arrange.

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req //
    .POST("/body")
    .send("text body");

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.is(await res.body.text(), "body=[text body]");
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
    .send("omg");

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

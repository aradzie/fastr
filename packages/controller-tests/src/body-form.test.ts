import { body, controller, http, type Pipe } from "@fastr/controller";
import { BadRequestError } from "@fastr/errors";
import { injectable } from "@fastr/invert";
import test from "ava";
import { z, type ZodSchema } from "zod";
import { helper } from "./helper.js";

const check = (schema: ZodSchema): Pipe => {
  return (ctx, value) => {
    try {
      return schema.parse(value);
    } catch (err) {
      throw new BadRequestError("Invalid Body", { cause: err });
    }
  };
};

const Body = z.object({
  type: z.string().includes("form body"),
});

type TBody = z.infer<typeof Body>;

@injectable()
@controller()
class Controller1 {
  @http.POST("/body")
  formBody(@body.form(check(Body)) value: TBody) {
    return `body=${format(JSON.stringify(value))}`;
  }
}

test("process body", async (t) => {
  // Arrange.

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req //
    .POST("/body")
    .send(new URLSearchParams([["type", "form body"]]));

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.is(await res.body.text(), 'body=[{"type":"form body"}]');
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
    .send(new URLSearchParams([["type", "omg"]]));

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

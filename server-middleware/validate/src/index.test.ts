import { expectForm, expectJson } from "@webfx-middleware/body";
import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import Joi from "joi";
import Koa from "koa";
import { validate } from "./index";

test("validate query", async (t) => {
  const app = new Koa();
  app.use(
    validate({
      query: Joi.object({
        value: Joi.string().required(),
      }),
    }),
  );
  app.use(async (ctx) => {
    ctx.response.body = {};
  });
  const srv = start(app.callback());

  t.is((await request.post("/").use(srv).send()).status, 400);
  t.is((await request.post("/?extra=fail").use(srv).send()).status, 400);
  t.is((await request.post("/?value=ok").use(srv).send()).status, 200);
});

test("validate json body", async (t) => {
  const app = new Koa();
  app.use(expectJson());
  app.use(
    validate({
      json: Joi.object({
        value: Joi.string().required(),
      }),
    }),
  );
  app.use(async (ctx) => {
    ctx.response.body = {};
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .sendJson({ extra: "fail" })
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .sendJson({ value: "ok" })
    ).status,
    200,
  );
});

test("validate form body", async (t) => {
  const app = new Koa();
  app.use(expectForm());
  app.use(
    validate({
      form: Joi.object({
        value: Joi.string().required(),
      }),
    }),
  );
  app.use(async (ctx) => {
    ctx.response.body = {};
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send(new URLSearchParams("extra=fail"))
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send(new URLSearchParams("value=ok"))
    ).status,
    200,
  );
});

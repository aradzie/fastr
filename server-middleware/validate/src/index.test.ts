import { expectForm, expectJson } from "@webfx-middleware/body";
import test from "ava";
import Joi from "joi";
import Koa from "koa";
import supertest from "supertest";
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

  const agent = supertest.agent(app.listen());

  t.is((await agent.post("/")).status, 400);
  t.is((await agent.post("/?extra=fail")).status, 400);
  t.is((await agent.post("/?value=ok")).status, 200);
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

  const agent = supertest.agent(app.listen());

  t.is((await agent.post("/").send({ extra: "fail" })).status, 400);
  t.is((await agent.post("/").send({ value: "ok" })).status, 200);
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

  const agent = supertest.agent(app.listen());

  t.is(
    (await agent.post("/").type("form").send({ extra: "fail" })).status,
    400,
  );
  t.is((await agent.post("/").type("form").send({ value: "ok" })).status, 200);
});

import test from "ava";
import type Koa from "koa";
import { compose } from "./compose.js";

test("compose middlewares", async (t) => {
  const context = { state: {} } as Koa.Context;

  {
    const middleware = compose([]);
    t.is(await middleware(context), undefined);
    t.is((await middleware(context, async () => "last")) as any, "last");
    t.is(middleware.name, "composed[]");
  }

  {
    const middleware = compose([a]) as compose.ComposedMiddleware<Koa.Context>;
    t.is((await middleware(context)) as any, "a:?");
    t.is((await middleware(context, async () => "last")) as any, "a:last");
    t.is(middleware.name, "composed[a]");
  }

  {
    const middleware = compose([a, b, c]) as compose.ComposedMiddleware<
      Koa.Context
    >;
    t.is((await middleware(context)) as any, "a:b:c:?");
    t.is((await middleware(context, async () => "last")) as any, "a:b:c:last");
    t.is(middleware.name, "composed[a,b,c]");
  }

  {
    const middleware = compose([
      a,
      compose([b, c]),
    ]) as compose.ComposedMiddleware<Koa.Context>;
    t.is((await middleware(context)) as any, "a:b:c:?");
    t.is((await middleware(context, async () => "last")) as any, "a:b:c:last");
    t.is(middleware.name, "composed[a,b,c]");
  }

  {
    const middleware = compose([
      a,
      compose([b, compose([c])]),
    ]) as compose.ComposedMiddleware<Koa.Context>;
    t.is((await middleware(context)) as any, "a:b:c:?");
    t.is((await middleware(context, async () => "last")) as any, "a:b:c:last");
    t.is(middleware.name, "composed[a,b,c]");
  }

  {
    const middleware = compose([buggy]);
    t.is(middleware.name, "composed[buggy]");
  }
});

test("catch errors", async (t) => {
  const context = { state: {} } as Koa.Context;

  {
    const middleware = compose([]);
    await t.throwsAsync(middleware(context, fail), { message: "omg" });
  }

  {
    const middleware = compose([fail]);
    await t.throwsAsync(middleware(context), { message: "omg" });
  }

  {
    const middleware = compose([a]) as compose.ComposedMiddleware<Koa.Context>;
    await t.throwsAsync(middleware(context, fail), { message: "omg" });
  }

  {
    const middleware = compose([a, fail]) as compose.ComposedMiddleware<
      Koa.Context
    >;
    await t.throwsAsync(middleware(context), { message: "omg" });
  }

  {
    const middleware = compose([a, b, c]) as compose.ComposedMiddleware<
      Koa.Context
    >;
    await t.throwsAsync(middleware(context, fail), { message: "omg" });
  }

  {
    const middleware = compose([a, b, c, fail]) as compose.ComposedMiddleware<
      Koa.Context
    >;
    await t.throwsAsync(middleware(context), { message: "omg" });
  }
});

test("call next multiple times", async (t) => {
  const context = { state: {} } as Koa.Context;
  const middleware = compose([buggy]);

  await t.throwsAsync(
    middleware(context, () => Promise.resolve()),
    {
      message: "next() called multiple times",
    },
  );
});

async function a(ctx: Koa.Context, next: Koa.Next) {
  return `a:${(await next()) ?? "?"}`;
}

async function b(ctx: Koa.Context, next: Koa.Next) {
  return `b:${(await next()) ?? "?"}`;
}

async function c(ctx: Koa.Context, next: Koa.Next) {
  return `c:${(await next()) ?? "?"}`;
}

async function fail() {
  throw new Error("omg");
}

function buggy(ctx: Koa.Context, next: Koa.Next) {
  next();
  next();
}

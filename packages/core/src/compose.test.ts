import test from "ava";
import { compose } from "./compose.js";
import { type Context } from "./context.js";
import { type Next } from "./middleware.js";

test("compose middleware", async (t) => {
  {
    const middleware = compose([]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await middleware(ctx);
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([a]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await middleware(ctx);
    t.is(ctx.state.answer, "a:x");
  }

  {
    const middleware = compose([a, b, c]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await middleware(ctx);
    t.is(ctx.state.answer, "a:b:c:x");
  }

  {
    const middleware = compose([a, compose([b, c])]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await middleware(ctx);
    t.is(ctx.state.answer, "a:b:c:x");
  }

  {
    const middleware = compose([a, compose([b, compose([c])])]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await middleware(ctx);
    t.is(ctx.state.answer, "a:b:c:x");
  }
});

test("catch errors", async (t) => {
  {
    const middleware = compose([]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx, fail);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([fail]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([a]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx, fail);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([a, fail]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([a, b, c]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx, fail);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }

  {
    const middleware = compose([a, b, c, fail]);
    const ctx = { state: { answer: "x" } } as Context<State>;
    await t.throwsAsync(
      async () => {
        await middleware(ctx);
      },
      { message: "omg" },
    );
    t.is(ctx.state.answer, "x");
  }
});

test("call next multiple times", async (t) => {
  const middleware = compose([buggy, a, b, c]);
  const ctx = { state: { answer: "x" } } as Context<State>;
  await t.throwsAsync(
    async () => {
      await middleware(ctx);
    },
    {
      message: "next() called multiple times",
    },
  );
  t.is(ctx.state.answer, "a:b:c:x");
});

interface State {
  answer: string;
}

async function a({ state }: Context<State>, next: Next): Promise<void> {
  await next();
  state.answer = `a:${state.answer}`;
}

async function b({ state }: Context<State>, next: Next): Promise<void> {
  await next();
  state.answer = `b:${state.answer}`;
}

async function c({ state }: Context<State>, next: Next): Promise<void> {
  await next();
  state.answer = `c:${state.answer}`;
}

async function fail(): Promise<void> {
  throw new Error("omg");
}

async function buggy(ctx: Context, next: Next): Promise<void> {
  await next();
  await next();
}

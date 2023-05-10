import { type Context } from "@fastr/core";
import { MethodNotAllowedError } from "@fastr/errors";
import { Container } from "@fastr/invert";
import test from "ava";
import { Router } from "./router.js";
import { type RouterState } from "./types.js";

test("empty router", async (t) => {
  const router = new Router<State>();

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/", "GET");
    await t.notThrowsAsync(async () => {
      await middleware(ctx, dummyNext);
    });
  }

  {
    const ctx = fakeContext(router, "/anything", "GET");
    await t.notThrowsAsync(async () => {
      await middleware(ctx, dummyNext);
    });
  }

  t.throws(
    () => {
      router.namedRoute("anything");
    },
    { message: 'Unknown route name "anything"' },
  );
  t.throws(
    () => {
      router.makePath("anything", {});
    },
    { message: 'Unknown route name "anything"' },
  );
});

test("router returns named routes", (t) => {
  const router = new Router<State>();

  router.get("route1", "/a", () => {}).get("route2", "/b", () => {});

  t.is(router.namedRoute("route1").name, "route1");
  t.is(router.namedRoute("route2").name, "route2");
  t.throws(
    () => {
      router.namedRoute("unknown");
    },
    { message: 'Unknown route name "unknown"' },
  );
});

test("router makes paths", (t) => {
  const router = new Router<State>();

  router
    .get("route1", "/a-{p1}/{p2}", () => {})
    .get("route2", "/a/b/c", () => {});

  t.is(router.makePath("route1", { p1: "v1", p2: "v2" }), "/a-v1/v2");
  t.is(router.makePath("route2", { unknown: "value" }), "/a/b/c");
  t.throws(
    () => {
      router.makePath("unknown", {});
    },
    { message: 'Unknown route name "unknown"' },
  );
});

test("router finds routes by path and method", async (t) => {
  const router = new Router<State>();

  router
    .get("/", ({ state }) => {
      state.answer = "get /";
    })
    .put("/", ({ state }) => {
      state.answer = "put /";
    })
    .get("/a", ({ state }) => {
      state.answer = "get /a";
    })
    .put("/a", ({ state }) => {
      state.answer = "put /a";
    })
    .get("/a/x", ({ state }) => {
      state.answer = "get /a/x";
    })
    .put("/a/x", ({ state }) => {
      state.answer = "put /a/x";
    })
    .get("/a/{v}", ({ state }) => {
      state.answer = `get /a/{${state.params.v}}`;
    })
    .put("/a/{v}", ({ state }) => {
      state.answer = `put /a/{${state.params.v}}`;
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /");
  }

  {
    const ctx = fakeContext(router, "/", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /");
  }

  {
    const ctx = fakeContext(router, "/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /a");
  }

  {
    const ctx = fakeContext(router, "/a", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /a");
  }

  {
    const ctx = fakeContext(router, "/a/x", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /a/x");
  }

  {
    const ctx = fakeContext(router, "/a/x", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /a/x");
  }

  {
    const ctx = fakeContext(router, "/a/X", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /a/{X}");
  }

  {
    const ctx = fakeContext(router, "/a/Y", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /a/{Y}");
  }

  {
    const ctx = fakeContext(router, "/not/found", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "");
  }
});

test("router matches methods", async (t) => {
  const router = new Router<State>();

  router
    .get("/", ({ state }) => {
      state.answer = "get /";
    })
    .put("/", ({ state }) => {
      state.answer = "put /";
    })
    .get("/x", ({ state }) => {
      state.answer = "get /x";
    })
    .put("/x", ({ state }) => {
      state.answer = "put /x";
    })
    .any("/x", ({ state }) => {
      state.answer = "any /x";
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /");
  }

  {
    const ctx = fakeContext(router, "/", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /");
  }

  {
    const ctx = fakeContext(router, "/", "DELETE");
    await t.throwsAsync(
      async () => {
        await middleware(ctx, dummyNext);
      },
      {
        instanceOf: MethodNotAllowedError,
      },
    );
    t.is(ctx.state.answer, "");
  }

  {
    const ctx = fakeContext(router, "/x", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /x");
  }

  {
    const ctx = fakeContext(router, "/x", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "put /x");
  }

  {
    const ctx = fakeContext(router, "/x", "DELETE");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "any /x");
  }
});

test("router uses middlewares", async (t) => {
  const router = new Router<State>();

  router
    .use(async ({ state }, next) => {
      await next();
      state.answer = `(${state.answer})`;
    })
    .use(async ({ state }, next) => {
      await next();
      state.answer = `[${state.answer}]`;
    })
    .get(
      "/a",
      async ({ state }, next) => {
        await next();
        state.answer = `a:${state.answer}`;
      },
      ({ state }) => {
        state.answer = "get /a";
      },
    )
    .get(
      "/b",
      async ({ state }, next) => {
        await next();
        state.answer = `b:${state.answer}`;
      },
      ({ state }) => {
        state.answer = "get /b";
      },
    );

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "([a:get /a])");
  }

  {
    const ctx = fakeContext(router, "/b", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "([b:get /b])");
  }
});

test("router applies prefix", async (t) => {
  const router = new Router<State>({ prefix: "/prefix-{p}/" });

  router
    .get("n1", "/a", ({ state }) => {
      state.answer = `get /a p=${state.params.p}`;
    })
    .get("n2", "/b", ({ state }) => {
      state.answer = `get /b p=${state.params.p}`;
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/prefix-x/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /a p=x");
  }

  {
    const ctx = fakeContext(router, "/prefix-y/b", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "get /b p=y");
  }

  {
    const ctx = fakeContext(router, "/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "");
  }

  {
    const ctx = fakeContext(router, "/b", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "");
  }

  {
    const ctx = fakeContext(router, "/prefix", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, ""); // TODO
  }

  {
    const ctx = fakeContext(router, "/prefix-x/x", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "");
  }

  t.is(router.makePath("n1", { p: "x" }), "/prefix-x/a");
  t.is(router.makePath("n2", { p: "x" }), "/prefix-x/b");
});

test("router updates context", async (t) => {
  const router = new Router<State>();

  let x = null as any;
  router.get("/", (ctx) => {
    x = ctx;
  });

  const middleware = router.middleware();
  const ctx = fakeContext(router, "/", "GET");
  await middleware(ctx, dummyNext);

  t.is(x.state.router, router);
});

type State = {
  answer: string;
};

function fakeContext(router: Router, path: string, method: string) {
  return {
    container: new Container(),
    request: {
      path,
      method,
    },
    state: {
      router,
      params: {},
      answer: "",
    } as RouterState,
  } as Context<RouterState>;
}

function dummyNext() {
  return Promise.resolve();
}

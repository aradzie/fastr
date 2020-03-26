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

  {
    const ctx = fakeContext(router, "*", "OPTIONS");
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

  router.GET("route1", "/a", () => {}).GET("route2", "/b", () => {});

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
    .GET("route1", "/a-{p1}/{p2}", () => {})
    .GET("route2", "/a/b/c", () => {});

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
    .GET("/", ({ state }) => {
      state.answer = "GET /";
    })
    .PUT("/", ({ state }) => {
      state.answer = "PUT /";
    })
    .addRoute("OPTIONS", "/", ({ state }) => {
      state.answer = `OPTIONS /`;
    })
    .GET("/a", ({ state }) => {
      state.answer = "GET /a";
    })
    .PUT("/a", ({ state }) => {
      state.answer = "PUT /a";
    })
    .GET("/a/x", ({ state }) => {
      state.answer = "GET /a/x";
    })
    .PUT("/a/x", ({ state }) => {
      state.answer = "PUT /a/x";
    })
    .GET("/a/{v}", ({ state }) => {
      state.answer = `GET /a/{${state.params.v}}`;
    })
    .PUT("/a/{v}", ({ state }) => {
      state.answer = `PUT /a/{${state.params.v}}`;
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /");
  }

  {
    const ctx = fakeContext(router, "/", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /");
  }

  {
    const ctx = fakeContext(router, "/", "OPTIONS");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "OPTIONS /");
  }

  {
    const ctx = fakeContext(router, "/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /a");
  }

  {
    const ctx = fakeContext(router, "/a", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /a");
  }

  {
    const ctx = fakeContext(router, "/a/x", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /a/x");
  }

  {
    const ctx = fakeContext(router, "/a/x", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /a/x");
  }

  {
    const ctx = fakeContext(router, "/a/X", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /a/{X}");
  }

  {
    const ctx = fakeContext(router, "/a/Y", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /a/{Y}");
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
    .GET("/", ({ state }) => {
      state.answer = "GET /";
    })
    .PUT("/", ({ state }) => {
      state.answer = "PUT /";
    })
    .GET("/x", ({ state }) => {
      state.answer = "GET /x";
    })
    .PUT("/x", ({ state }) => {
      state.answer = "PUT /x";
    })
    .addRoute("OPTIONS", "/x", ({ state }) => {
      state.answer = `OPTIONS /x`;
    })
    .ANY("/x", ({ state }) => {
      state.answer = "ANY /x";
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /");
  }

  {
    const ctx = fakeContext(router, "/", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /");
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
    t.is(ctx.state.answer, "GET /x");
  }

  {
    const ctx = fakeContext(router, "/x", "PUT");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "PUT /x");
  }

  {
    const ctx = fakeContext(router, "/x", "OPTIONS");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "OPTIONS /x");
  }

  {
    const ctx = fakeContext(router, "/x", "DELETE");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "ANY /x");
  }
});

test("router uses middleware", async (t) => {
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
    .GET(
      "/a",
      async ({ state }, next) => {
        await next();
        state.answer = `a:${state.answer}`;
      },
      ({ state }) => {
        state.answer = "GET /a";
      },
    )
    .GET(
      "/b",
      async ({ state }, next) => {
        await next();
        state.answer = `b:${state.answer}`;
      },
      ({ state }) => {
        state.answer = "GET /b";
      },
    );

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "([a:GET /a])");
  }

  {
    const ctx = fakeContext(router, "/b", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "([b:GET /b])");
  }
});

test("router applies prefix", async (t) => {
  const router = new Router<State>({ prefix: "/prefix-{p}/" });

  router
    .GET("n1", "/a", ({ state }) => {
      state.answer = `GET /a p=${state.params.p}`;
    })
    .GET("n2", "/b", ({ state }) => {
      state.answer = `GET /b p=${state.params.p}`;
    });

  const middleware = router.middleware();

  {
    const ctx = fakeContext(router, "/prefix-x/a", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /a p=x");
  }

  {
    const ctx = fakeContext(router, "/prefix-y/b", "GET");
    await middleware(ctx, dummyNext);
    t.is(ctx.state.answer, "GET /b p=y");
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
  router.GET("/", (ctx) => {
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

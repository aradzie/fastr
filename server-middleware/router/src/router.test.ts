import { MethodNotAllowedError } from "@webfx-http/error";
import test from "ava";
import { Router } from "./router.js";
import type { RouterContext } from "./types.js";

test("empty router", async (t) => {
  const router = new Router();

  const middleware = router.middleware();

  t.is(await middleware(fakeContext(router, "/", "GET"), dummyNext), undefined);
  t.is(
    await middleware(fakeContext(router, "/anything", "GET"), dummyNext),
    undefined,
  );
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
  const router = new Router();

  router
    .get("route1", "/a", () => "get /a")
    .get("route2", "/b", () => "get /b");

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
  const router = new Router();

  router
    .get("route1", "/a-{p1}/{p2}", () => "get /a")
    .get("route2", "/a/b/c", () => "get /a");

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
  const router = new Router();

  router
    .get("/", () => "get /")
    .put("/", () => "put /")
    .get("/a", () => "get /a")
    .put("/a", () => "put /a")
    .get("/a/x", () => "get /a/x")
    .put("/a/x", () => "put /a/x")
    .get("/a/{v}", ({ params: { v } }) => `get /a/{${v}}`)
    .put("/a/{v}", ({ params: { v } }) => `put /a/{${v}}`);

  const middleware = router.middleware();

  t.is(await middleware(fakeContext(router, "/", "GET"), dummyNext), "get /");
  t.is(await middleware(fakeContext(router, "/", "PUT"), dummyNext), "put /");
  t.is(await middleware(fakeContext(router, "/a", "GET"), dummyNext), "get /a");
  t.is(await middleware(fakeContext(router, "/a", "PUT"), dummyNext), "put /a");
  t.is(
    await middleware(fakeContext(router, "/a/x", "GET"), dummyNext),
    "get /a/x",
  );
  t.is(
    await middleware(fakeContext(router, "/a/x", "PUT"), dummyNext),
    "put /a/x",
  );
  t.is(
    await middleware(fakeContext(router, "/a/X", "GET"), dummyNext),
    "get /a/{X}",
  );
  t.is(
    await middleware(fakeContext(router, "/a/Y", "PUT"), dummyNext),
    "put /a/{Y}",
  );
  t.is(
    await middleware(fakeContext(router, "/not/found", "GET"), dummyNext),
    undefined,
  );
});

test("router matches methods", async (t) => {
  const router = new Router();

  router
    .get("/", () => "get /")
    .put("/", () => "put /")
    .get("/x", () => "get /x")
    .put("/x", () => "put /x")
    .any("/x", () => "any /x");

  const middleware = router.middleware();

  t.is(await middleware(fakeContext(router, "/", "GET"), dummyNext), "get /");
  t.is(await middleware(fakeContext(router, "/", "PUT"), dummyNext), "put /");
  await t.throwsAsync(
    async () => {
      await middleware(fakeContext(router, "/", "DELETE"), dummyNext);
    },
    { instanceOf: MethodNotAllowedError },
  );

  t.is(await middleware(fakeContext(router, "/x", "GET"), dummyNext), "get /x");
  t.is(await middleware(fakeContext(router, "/x", "PUT"), dummyNext), "put /x");
  t.is(
    await middleware(fakeContext(router, "/x", "DELETE"), dummyNext),
    "any /x",
  );
});

test("router uses middlewares", async (t) => {
  const router = new Router();

  router
    .use(async (ctx, next) => `[${await next()}]`)
    .use(async (ctx, next) => `(${await next()})`)
    .get(
      "/a",
      async (ctx, next) => `a+${await next()}`,
      () => "get /a",
    )
    .get(
      "/b",
      async (ctx, next) => `b+${await next()}`,
      () => "get /b",
    );

  const middleware = router.middleware();

  t.is(
    await middleware(fakeContext(router, "/a", "GET"), dummyNext),
    "[(a+get /a)]",
  );
  t.is(
    await middleware(fakeContext(router, "/b", "GET"), dummyNext),
    "[(b+get /b)]",
  );
});

test("router applies prefix", async (t) => {
  const router = new Router({ prefix: "/prefix-{p}/" });

  router
    .get("n1", "/a", ({ params }) => `get /a ${params.p}`)
    .get("n2", "/b", ({ params }) => `get /b ${params.p}`);

  const middleware = router.middleware();

  t.is(
    await middleware(fakeContext(router, "/prefix-x/a", "GET"), dummyNext),
    "get /a x",
  );
  t.is(
    await middleware(fakeContext(router, "/prefix-y/b", "GET"), dummyNext),
    "get /b y",
  );
  t.is(
    await middleware(fakeContext(router, "/a", "GET"), dummyNext),
    undefined,
  );
  t.is(
    await middleware(fakeContext(router, "/b", "GET"), dummyNext),
    undefined,
  );
  t.is(
    await middleware(fakeContext(router, "/prefix", "GET"), dummyNext),
    undefined,
  ); // TODO
  t.is(
    await middleware(fakeContext(router, "/prefix-x/x", "GET"), dummyNext),
    undefined,
  );

  t.is(router.makePath("n1", { p: "x" }), "/prefix-x/a");
  t.is(router.makePath("n2", { p: "x" }), "/prefix-x/b");
});

test("router updates context", async (t) => {
  const router = new Router();

  let x: RouterContext | null = null;
  router.get("/", (ctx) => {
    x = ctx;
  });

  await router.middleware()(fakeContext(router, "/", "GET"), dummyNext);
  t.not(x, null);
  t.true("router" in x!);
  t.true("params" in x!);
  t.is(x!.router, router);
});

function fakeContext(router: Router, path: string, method: string) {
  return {
    request: {
      path,
      method,
    },
    params: {},
    router,
  } as RouterContext;
}

function dummyNext() {
  return Promise.resolve();
}

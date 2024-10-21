import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test, { registerCompletionHandler } from "ava";

registerCompletionHandler(() => {
  process.exit();
});

test("normalize path", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = ctx.request.path;
  });
  const server = start(app.callback());

  const ask = async (path: string): Promise<string> =>
    await (await request.use(server).GET(path).send()).body.text();

  // Assert.

  t.is(await ask("/"), "/");
  t.is(await ask("/x"), "/x");
  t.is(await ask("/x/"), "/x/");
  t.is(await ask("//x//"), "//x//");
  t.is(await ask("/x/y"), "/x/y");
  t.is(await ask("//x//y"), "//x//y");
  t.is(await ask("/x/y/"), "/x/y/");
  t.is(await ask("//x//y//"), "//x//y//");

  t.is(await ask("/.x"), "/.x");
  t.is(await ask("/x."), "/x.");
  t.is(await ask("/x.y"), "/x.y");
  t.is(await ask("/x.."), "/x..");
  t.is(await ask("/..x"), "/..x");
  t.is(await ask("/x..y"), "/x..y");

  t.is(await ask("/."), "/");
  t.is(await ask("/./"), "/");
  t.is(await ask("/./."), "/");
  t.is(await ask("/././"), "/");
  t.is(await ask("/././x"), "/x");
  t.is(await ask("/././x/./."), "/x/");

  t.is(await ask("/.."), "/");
  t.is(await ask("/../"), "/");
  t.is(await ask("/../.."), "/");
  t.is(await ask("/../../x"), "/x");
  t.is(await ask("/../../x/.."), "/");
  t.is(await ask("/../../x/../"), "/");
  t.is(await ask("/../../x/../.."), "/");

  t.is(await ask("/%"), "/%");
  t.is(await ask("/%1"), "/%1");
  t.is(await ask("/%XX"), "/%XX");
  t.is(await ask("/%whatever"), "/%whatever");
  t.is(await ask("/%78/%79/%7A"), "/%78/%79/%7A");
  t.is(await ask("/x%2Fy%2Fz"), "/x%2Fy%2Fz");
  t.is(await ask("/%78%2F%79%2F%7A"), "/%78%2F%79%2F%7A");
  t.is(await ask("/%F0%9F%8D%AC"), "/%F0%9F%8D%AC");
});

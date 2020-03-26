import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";

import test from "ava";

test("detect remote host and proto", async (t) => {
  // Arrange.

  const app = new Application(null, { behindProxy: true });
  app.use((ctx) => {
    ctx.response.body = `${ctx.request.origin}`;
    ctx.response.type = "text/plain";
  });

  const server = start(app.callback());

  {
    // Act.

    const response = await request.use(server).get("/").send();

    // Assert.

    t.is(response.status, 200);
    t.regex(await response.body.text(), /http:\/\/\[::]:\d+/);
  }

  {
    // Act.

    const response = await request
      .use(server)
      .get("/")
      .header("Forwarded", "host=host1; proto=https")
      .send();

    // Assert.

    t.is(response.status, 200);
    t.is(await response.body.text(), "https://host1");
  }

  {
    // Act.

    const response = await request
      .use(server)
      .get("/")
      .header("X-Forwarded-Host", "host2")
      .header("X-Forwarded-Proto", "http")
      .send();

    // Assert.

    t.is(response.status, 200);
    t.is(await response.body.text(), "http://host2");
  }

  {
    // Act.

    const response = await request
      .use(server)
      .get("/")
      .header("Forwarded", "host=host1; proto=https")
      .header("X-Forwarded-Host", "host2")
      .header("X-Forwarded-Proto", "http")
      .send();

    // Assert.

    t.is(response.status, 200);
    t.is(await response.body.text(), "https://host1");
  }

  {
    // Act.

    const response = await request
      .use(server)
      .get("/")
      .header("Forwarded", "for=192.168.1.1")
      .header("X-Forwarded-Host", "host2")
      .header("X-Forwarded-Proto", "http")
      .send();

    // Assert.

    t.is(response.status, 200);
    t.is(await response.body.text(), "http://host2");
  }
});

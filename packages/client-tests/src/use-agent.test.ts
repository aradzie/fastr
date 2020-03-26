import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import test from "ava";
import { Agent } from "http";

test("get text", async (t) => {
  // Arrange.

  let lastReq: any = null;
  const server = start((req, res) => {
    const { url, method } = req;
    const headers = { ...req.headers };
    delete headers.host;
    lastReq = { url, method, headers };
    res.setHeader("Content-Type", "text/plain");
    res.end("done");
  });
  const req = request.use(server);
  const agent = new Agent({ keepAlive: true });

  // First request.

  {
    // Act.

    const { ok, status, statusText, body } = await req({
      url: "/test1",
      method: "GET",
      options: {
        agent,
      },
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.is(await body.text(), "done");
    t.deepEqual(lastReq, {
      url: "/test1",
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "connection": "keep-alive",
      },
    });
  }

  // Second request.

  {
    // Act.

    const { ok, status, statusText, body } = await req({
      url: "/test2",
      method: "GET",
      options: {
        agent,
      },
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.is(await body.text(), "done");
    t.deepEqual(lastReq, {
      url: "/test2",
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "connection": "keep-alive",
      },
    });
  }

  // Cleanup.

  agent.destroy();
});

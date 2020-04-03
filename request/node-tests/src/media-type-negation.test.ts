import { Accept, Headers, MimeType } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import { test } from "./util";

test("negotiate media type", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    const accept = Headers.from(req.headers).accept() ?? Accept.ANY;

    if (accept.accepts("text/plain")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("text");
      return;
    }

    if (accept.accepts("application/json")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ type: "json" }));
      return;
    }

    res.statusCode = 400;
    res.end();
  });

  {
    // Act.

    const { ok, status, statusText, headers, body } = await request({
      url: server.url("/test"),
      method: "GET",
      headers: Headers.builder().accept("text/plain").build(),
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.deepEqual(headers.contentType(), MimeType.TEXT_PLAIN);
    t.is((await body.buffer()).toString("utf8"), "text");
  }

  {
    // Act.

    const { ok, status, statusText, headers, body } = await request({
      url: server.url("/test"),
      method: "GET",
      headers: Headers.builder().accept("application/json").build(),
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.deepEqual(headers.contentType(), MimeType.APPLICATION_JSON);
    t.deepEqual(await body.json(), { type: "json" });
  }
});

import { Accept, HttpHeaders, MediaType } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";

test("negotiate media type", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    const accept =
      new HttpHeaders(req.headers).map("Accept", Accept.parse) ?? Accept.any();

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
  const req = request.use(server);

  {
    // Act.

    const { ok, status, statusText, headers, body } = await req({
      url: "/test",
      method: "GET",
      headers: new HttpHeaders().set("Accept", "text/plain"),
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.deepEqual(
      headers.map("Content-Type", MediaType.parse),
      MediaType.TEXT_PLAIN,
    );
    t.is(await body.text(), "text");
  }

  {
    // Act.

    const { ok, status, statusText, headers, body } = await req({
      url: "/test",
      method: "GET",
      headers: new HttpHeaders().set("Accept", "application/json"),
    });

    // Assert.

    t.true(ok);
    t.is(status, 200);
    t.is(statusText, "OK");
    t.deepEqual(
      headers.map("Content-Type", MediaType.parse),
      MediaType.APPLICATION_JSON,
    );
    t.deepEqual(await body.json(), { type: "json" });
  }
});

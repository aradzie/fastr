import { HttpHeaders, request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Accept, MediaType } from "@fastr/headers";
import test from "ava";

test("negotiate media type", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    const accept =
      new HttpHeaders(req.headers).map("Accept", Accept.parse) ?? Accept.any();

    switch (accept.negotiate("text/plain", "application/json")) {
      case "text/plain":
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("text");
        break;
      case "application/json":
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ type: "json" }));
        break;
      default:
        res.statusCode = 400;
        res.end();
        break;
    }
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
      new MediaType("text", "plain"),
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
      new MediaType("application", "json"),
    );
    t.deepEqual(await body.json(), { type: "json" });
  }
});

import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import { Readable } from "stream";

test("abort response", async (t) => {
  // Arrange.

  const server = start((req, res) => {
    // Pipe infinite stream into response.
    new Readable({
      read(): void {
        this.push("payload\n");
      },
    }).pipe(res);
  });
  const req = request.use(server);

  // Act.

  const response = await req({
    url: "/test",
    method: "GET",
  });
  const { ok, status, statusText, headers, body } = response;

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Content-Length"), null);
  response.abort();
  t.true((await body.buffer()).length < 1024 * 1024); // TODO Throw RequestAbortedError?
});

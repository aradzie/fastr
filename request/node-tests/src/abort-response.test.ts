import { request } from "@webfx-request/node";
import { Readable } from "stream";
import { test } from "./util";

test("abort response", async (t) => {
  const { server } = t.context;

  // Arrange.

  server.addRoute("GET", "/test", (req, res) => {
    res.statusCode = 200;
    const infinite = new Readable({
      read(): void {
        this.push("payload\n");
      },
    });
    infinite.pipe(res);
  });

  // Act.

  const response = await request({
    url: server.url("/test"),
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
  t.true((await body.buffer()).length < 1024 * 1024);
});

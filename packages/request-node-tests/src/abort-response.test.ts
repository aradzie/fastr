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
  const { ok, status, statusText, body } = response;

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  response.abort();
  await t.throwsAsync(
    async () => {
      await body.buffer();
    },
    {
      name: "Error",
      message: "Destroyed stream",
    },
  );
});

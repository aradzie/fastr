import { Readable } from "node:stream";
import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import test, { registerCompletionHandler } from "ava";

registerCompletionHandler(() => {
  process.exit();
});

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

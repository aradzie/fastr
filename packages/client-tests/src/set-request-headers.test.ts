import { HttpHeaders, request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import test from "ava";

test("set headers to default values", async (t) => {
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

  // Act.

  const { ok, status, statusText, body } = await req({
    url: "/test",
    method: "GET",
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.is(await body.text(), "done");
  t.deepEqual(lastReq, {
    url: "/test",
    method: "GET",
    headers: {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "connection": "close",
    },
  });
});

test("use custom header values", async (t) => {
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

  // Act.

  const { ok, status, statusText, body } = await req({
    url: "/test",
    method: "GET",
    headers: new HttpHeaders({
      "accept": "text/plain",
      "accept-encoding": "identity",
    }),
  });

  // Assert.

  t.true(ok);
  t.is(status, 200);
  t.is(statusText, "OK");
  t.is(await body.text(), "done");
  t.deepEqual(lastReq, {
    url: "/test",
    method: "GET",
    headers: {
      "accept": "text/plain",
      "accept-encoding": "identity",
      "connection": "close",
    },
  });
});

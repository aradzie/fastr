import { Headers } from "@webfx-http/headers";
import test from "ava";
import { FakeHttpResponse } from "./response";

test("throw error", async (t) => {
  const error = new Error("omg");

  const adapter = FakeHttpResponse.throwError(error);

  await t.throwsAsync(
    async () => {
      await adapter({ method: "GET", url: "/" });
    },
    {
      is: error,
    },
  );
});

test("text body", async (t) => {
  const adapter = FakeHttpResponse.withBody("something", {
    status: 201,
    headers: Headers.from({ foo: "bar" }),
  });

  const response = await adapter({ method: "GET", url: "/" });

  t.true(response.ok);
  t.is(response.status, 201);
  t.is(response.statusText, "Created");
  t.deepEqual(response.headers.toJSON(), { foo: "bar" });
  t.is(await response.text(), "something");
});

test("ArrayBuffer body", async (t) => {
  const body = await new Blob(["something"]).arrayBuffer();
  const adapter = FakeHttpResponse.withBody(body, {
    status: 201,
    headers: Headers.from({ foo: "bar" }),
  });

  const response = await adapter({ method: "GET", url: "/" });

  t.true(response.ok);
  t.is(response.status, 201);
  t.is(response.statusText, "Created");
  t.deepEqual(response.headers.toJSON(), { foo: "bar" });
  t.is(await response.text(), "something");
});

test("ArrayBufferView body", async (t) => {
  const body = new Uint8Array(await new Blob(["something"]).arrayBuffer());
  const adapter = FakeHttpResponse.withBody(body, {
    status: 201,
    headers: Headers.from({ foo: "bar" }),
  });

  const response = await adapter({ method: "GET", url: "/" });

  t.true(response.ok);
  t.is(response.status, 201);
  t.is(response.statusText, "Created");
  t.deepEqual(response.headers.toJSON(), { foo: "bar" });
  t.is(await response.text(), "something");
});

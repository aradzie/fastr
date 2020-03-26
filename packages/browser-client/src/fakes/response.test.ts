import test from "ava";
import { FakeHttpResponse } from "./response.js";

test("response status", (t) => {
  t.like(new FakeHttpResponse({}), {
    status: 200,
    statusText: "OK",
  });
  t.like(new FakeHttpResponse({ status: 201 }), {
    status: 201,
    statusText: "Created",
  });
  t.like(new FakeHttpResponse({ statusText: "Good" }), {
    status: 200,
    statusText: "Good",
  });
  t.like(new FakeHttpResponse({ status: 400, statusText: "OMG" }), {
    status: 400,
    statusText: "OMG",
  });
});

test("empty body", async (t) => {
  const res = new FakeHttpResponse({});
  t.deepEqual(Object.fromEntries(res.headers), {});
  t.is(await res.text(), "");
});

test("empty body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "text/html" },
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/html",
  });
  t.is(await res.text(), "");
});

test("string body", async (t) => {
  const res = new FakeHttpResponse({
    body: "body",
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/plain",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("string body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "text/html" },
    body: "body",
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/html",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("blob body", async (t) => {
  const res = new FakeHttpResponse({
    body: new Blob(["body"], {}),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/octet-stream",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("typed blob body", async (t) => {
  const res = new FakeHttpResponse({
    body: new Blob(["body"], { type: "text/plain" }),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/plain",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("typed blob body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "text/html" },
    body: new Blob(["body"], { type: "text/plain" }),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/html",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("ArrayBuffer body", async (t) => {
  const res = new FakeHttpResponse({
    body: await new Blob(["body"], {}).arrayBuffer(),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/octet-stream",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("ArrayBuffer body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "text/html" },
    body: await new Blob(["body"], {}).arrayBuffer(),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/html",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("ArrayBufferView body", async (t) => {
  const res = new FakeHttpResponse({
    body: new Uint8Array(await new Blob(["body"], {}).arrayBuffer()),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/octet-stream",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("ArrayBufferView body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "text/html" },
    body: new Uint8Array(await new Blob(["body"], {}).arrayBuffer()),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "text/html",
    "content-length": "4",
  });
  t.is(await res.text(), "body");
});

test("URLSearchParams body", async (t) => {
  const res = new FakeHttpResponse({
    body: new URLSearchParams([
      ["a", "1"],
      ["b", "2"],
    ]),
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/x-www-form-urlencoded",
    "content-length": "7",
  });
  t.is(await res.text(), "a=1&b=2");
});

test("object body", async (t) => {
  const res = new FakeHttpResponse({
    body: { value: 123 },
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/json",
    "content-length": "13",
  });
  t.deepEqual(await res.json(), { value: 123 });
});

test("object body with custom type", async (t) => {
  const res = new FakeHttpResponse({
    headers: { "Content-Type": "application/foo" },
    body: { value: 123 },
  });
  t.deepEqual(Object.fromEntries(res.headers), {
    "content-type": "application/foo",
    "content-length": "13",
  });
  t.deepEqual(await res.json(), { value: 123 });
});

test("throw error", async (t) => {
  const error = new Error("omg");

  const adapter = FakeHttpResponse.throwError(error);

  await t.throwsAsync(adapter({ method: "GET", url: "/" }), {
    is: error,
  });
});

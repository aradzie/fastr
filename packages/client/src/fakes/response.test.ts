import test from "ava";
import { FakeResponse } from "./response.js";

test("response status", (t) => {
  t.like(new FakeResponse({}), {
    status: 200,
    statusText: "OK",
  });
  t.like(new FakeResponse({ status: 201 }), {
    status: 201,
    statusText: "Created",
  });
  t.like(new FakeResponse({ statusText: "Good" }), {
    status: 200,
    statusText: "Good",
  });
  t.like(new FakeResponse({ status: 400, statusText: "OMG" }), {
    status: 400,
    statusText: "OMG",
  });
});

test("empty body", async (t) => {
  const res = new FakeResponse({});
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/octet-stream",
  });
  t.is(await res.body.text(), "");
});

test("empty body with custom type", async (t) => {
  const res = new FakeResponse({
    headers: { "Content-Type": "text/html" },
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "text/html; charset=UTF-8",
  });
  t.is(await res.body.text(), "");
});

test("string body", async (t) => {
  const res = new FakeResponse({
    body: "body",
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "text/plain; charset=UTF-8",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("string body with custom type", async (t) => {
  const res = new FakeResponse({
    headers: { "Content-Type": "text/html" },
    body: "body",
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "text/html; charset=UTF-8",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("Buffer body", async (t) => {
  const res = new FakeResponse({
    body: Buffer.from("body"),
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/octet-stream",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("Buffer body with custom type", async (t) => {
  const res = new FakeResponse({
    headers: { "Content-Type": "text/html" },
    body: Buffer.from("body"),
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "text/html; charset=UTF-8",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("ArrayBufferView body", async (t) => {
  const res = new FakeResponse({
    body: new Uint8Array(Buffer.from("body")),
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/octet-stream",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("ArrayBufferView body with custom type", async (t) => {
  const res = new FakeResponse({
    headers: { "Content-Type": "text/html" },
    body: new Uint8Array(Buffer.from("body")),
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "text/html; charset=UTF-8",
    "Content-Length": "4",
  });
  t.is(await res.body.text(), "body");
});

test("URLSearchParams body", async (t) => {
  const res = new FakeResponse({
    body: new URLSearchParams([
      ["a", "1"],
      ["b", "2"],
    ]),
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Content-Length": "7",
  });
  t.is(await res.body.text(), "a=1&b=2");
});

test("object body", async (t) => {
  const res = new FakeResponse({
    body: { value: 123 },
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/json; charset=UTF-8",
    "Content-Length": "13",
  });
  t.deepEqual(await res.body.json(), { value: 123 });
});

test("object body with custom type", async (t) => {
  const res = new FakeResponse({
    headers: { "Content-Type": "application/foo" },
    body: { value: 123 },
  });
  t.deepEqual(res.headers.toJSON(), {
    "Content-Type": "application/foo; charset=UTF-8",
    "Content-Length": "13",
  });
  t.deepEqual(await res.body.json(), { value: 123 });
});

import { Headers, MediaType } from "@webfx-http/headers";
import test from "ava";
import { Readable } from "stream";
import { RequestBuilder } from "./builder";
import type { Adapter, HttpRequest, HttpResponse } from "./types";

test("build url query string", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "get", "/url?a=1")
    .query("a", 2)
    .query(new URLSearchParams("b=3"))
    .query(new Map([["c", 4]]))
    .query({ d: 5 })
    .query([["e", 6]]);

  // Assert.

  t.is(await builder.send(), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.method, "GET");
  t.is(req1.url, "/url?a=1&a=2&b=3&c=4&d=5&e=6");
});

test("build headers", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url")
    .accept("text/plain")
    .accept("text/*")
    .header("a", 1)
    .header(new Headers({ b: 2 }))
    .header(new Map([["c", 3]]))
    .header({ d: 4 })
    .header([["e", 5]]);

  // Assert.

  t.is(await builder.send(), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.method, "PUT");
  t.is(req1.url, "/url");
  t.deepEqual(req1.headers?.toJSON(), {
    Accept: "text/plain, text/*",
    a: "1",
    b: "2",
    c: "3",
    d: "4",
    e: "5",
  });
});

test("send empty body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "get", "/url");

  // Assert.

  t.is(await builder.send(), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, null);
});

test("send text body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send("some text"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, "some text");
  t.is(req1.headers?.map("Content-Type", MediaType.parse)?.name, "text/plain");
});

test("send text body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send("some text", "text/html"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, "some text");
  t.is(req1.headers?.map("Content-Type", MediaType.parse)?.name, "text/html");
});

test("send buffer body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body: Buffer = await Buffer.from("some text");

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(
    req1.headers?.map("Content-Type", MediaType.parse)?.name,
    "application/octet-stream",
  );
});

test("send buffer body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body: Buffer = await Buffer.from("some text");

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body, "foo/bar"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.map("Content-Type", MediaType.parse)?.name, "foo/bar");
});

test("send Readable body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = Readable.from(["some text"]);

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(
    req1.headers?.map("Content-Type", MediaType.parse)?.name,
    "application/octet-stream",
  );
});

test("send Readable body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = Readable.from(["some text"]);

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body, "foo/bar"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.map("Content-Type", MediaType.parse)?.name, "foo/bar");
});

test("send json body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send({ type: "json" }), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, '{"type":"json"}');
  t.is(
    req1.headers?.map("Content-Type", MediaType.parse)?.name,
    "application/json",
  );
});

test("send json body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send({ type: "json" }, "application/foo+json"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, '{"type":"json"}');
  t.is(
    req1.headers?.map("Content-Type", MediaType.parse)?.name,
    "application/foo+json",
  );
});

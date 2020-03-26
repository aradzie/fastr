import test from "ava";
import { RequestBuilder } from "./builder.js";
import { type Adapter, type HttpRequest, type HttpResponse } from "./types.js";

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
    .header(new Headers({ b: "2" }))
    .header(new Map([["c", 3]]))
    .header({ d: 4 })
    .header([["e", 5]]);

  // Assert.

  t.is(await builder.send(), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.method, "PUT");
  t.is(req1.url, "/url");
  t.deepEqual(Object.fromEntries(req1.headers ?? []), {
    accept: "text/plain, text/*",
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
  t.is(req1.headers?.get("Content-Type"), null);
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
  t.is(req1.headers?.get("Content-Type"), "text/html");
});

test("send blob body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const blob = new Blob(["some text"]);

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(blob), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, blob);
  t.is(req1.headers?.get("Content-Type"), "application/octet-stream");
});

test("send blob body with content type in blob", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const blob = new Blob(["some text"], { type: "foo/bar" });

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(blob), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, blob);
  t.is(req1.headers?.get("Content-Type"), "foo/bar");
});

test("send blob body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const blob = new Blob(["some text"]);

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(blob, "foo/bar"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, blob);
  t.is(req1.headers?.get("Content-Type"), "foo/bar");
});

test("send array buffer body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = await new Blob(["some text"]).arrayBuffer();

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.get("Content-Type"), "application/octet-stream");
});

test("send array buffer body with custom content type", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = await new Blob(["some text"]).arrayBuffer();

  // Act.

  const builder = new RequestBuilder(testAdapter, "put", "/url");

  // Assert.

  t.is(await builder.send(body, "foo/bar"), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.get("Content-Type"), "foo/bar");
});

test("send multipart form body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = new FormData();

  // Act.

  const builder = new RequestBuilder(testAdapter, "post", "/url");

  // Assert.

  t.is(await builder.sendForm(body), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.get("Content-Type"), null);
});

test("send url-encoded form body", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  const body = new URLSearchParams();

  // Act.

  const builder = new RequestBuilder(testAdapter, "post", "/url");

  // Assert.

  t.is(await builder.sendForm(body), res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, body);
  t.is(req1.headers?.get("Content-Type"), null);
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
  t.is(req1.headers?.get("Content-Type"), "application/json");
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
  t.is(req1.headers?.get("Content-Type"), "application/foo+json");
});

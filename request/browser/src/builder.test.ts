import { Headers } from "@webfx-http/headers";
import test from "ava";
import { polyfillBlobApi } from "./adapter/polyfills";
import { RequestBuilder } from "./builder";
import { Adapter, HttpRequest, HttpResponse } from "./types";

polyfillBlobApi(); // As it turns out jsdom still needs these polyfills.

test("build url query string", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "get", "/url?a=1")
    .query("a", 2)
    .query(new URLSearchParams("b=3"))
    .query(new Map([["c", 4]]))
    .query({ d: 5 })
    .query([["e", 6]]);

  // Assert.

  t.is(await builder.send(), response);
  t.is(request.method, "GET");
  t.is(request.url, "/url?a=1&a=2&b=3&c=4&d=5&e=6");
});

test("build headers", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url")
    .accept("text/plain")
    .accept("text/*")
    .header("a", 1)
    .header(Headers.from({ b: 2 }))
    .header(new Map([["c", 3]]))
    .header({ d: 4 })
    .header([["e", 5]]);

  // Assert.

  t.is(await builder.send(), response);
  t.is(request.method, "PUT");
  t.is(request.url, "/url");
  t.deepEqual(request.headers?.toJSON(), {
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

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "get", "/url");

  // Assert.

  t.is(await builder.send(), response);
  t.is(request.body, null);
});

test("send string body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody("some text"), response);
  t.is(request.body, "some text");
  t.is(request.headers?.contentType()?.name, "text/plain");
});

test("send string body with custom content type", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody("some text", "text/html"), response);
  t.is(request.body, "some text");
  t.is(request.headers?.contentType()?.name, "text/html");
});

test("send blob body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const blob = new Blob(["some text"]);

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody(blob), response);
  t.is(request.body, blob);
  t.is(request.headers?.contentType()?.name, "application/octet-stream");
});

test("send blob body with content type in blob", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const blob = new Blob(["some text"], { type: "foo/bar" });

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody(blob), response);
  t.is(request.body, blob);
  t.is(request.headers?.contentType()?.name, "foo/bar");
});

test("send blob body with custom content type", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const blob = new Blob(["some text"]);

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody(blob, "foo/bar"), response);
  t.is(request.body, blob);
  t.is(request.headers?.contentType()?.name, "foo/bar");
});

test("send array buffer body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const body = await new Blob(["some text"]).arrayBuffer();

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody(body), response);
  t.is(request.body, body);
  t.is(request.headers?.contentType()?.name, "application/octet-stream");
});

test("send array buffer body with custom content type", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const body = await new Blob(["some text"]).arrayBuffer();

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendBody(body, "foo/bar"), response);
  t.is(request.body, body);
  t.is(request.headers?.contentType()?.name, "foo/bar");
});

test("send multipart form body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const body = new FormData();

  // Act.

  const builder = new RequestBuilder(adapter, "post", "/url");

  // Assert.

  t.is(await builder.sendForm(body), response);
  t.is(request.body, body);
  t.is(request.headers?.contentType()?.name, "multipart/form-data");
});

test("send url-encoded form body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };
  const body = new URLSearchParams();

  // Act.

  const builder = new RequestBuilder(adapter, "post", "/url");

  // Assert.

  t.is(await builder.sendForm(body), response);
  t.is(request.body, body);
  t.is(
    request.headers?.contentType()?.name,
    "application/x-www-form-urlencoded",
  );
});

test("send json body", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(await builder.sendJson({ type: "json" }), response);
  t.is(request.body, '{"type":"json"}');
  t.is(request.headers?.contentType()?.name, "application/json");
});

test("send json body with custom content type", async (t) => {
  // Arrange.

  let request!: HttpRequest;
  const response = {} as HttpResponse;
  const adapter: Adapter = async (arg: HttpRequest) => {
    request = arg;
    return response;
  };

  // Act.

  const builder = new RequestBuilder(adapter, "put", "/url");

  // Assert.

  t.is(
    await builder.sendJson({ type: "json" }, "application/foo+json"),
    response,
  );
  t.is(request.body, '{"type":"json"}');
  t.is(request.headers?.contentType()?.name, "application/foo+json");
});

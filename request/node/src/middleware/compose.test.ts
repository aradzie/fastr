import test from "ava";
import { fakeOkResponse } from "../fakes";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { compose } from "./compose";

test("compose zero middlewares", async (t) => {
  // Arrange.

  const middleware = compose([]);

  // Act.

  const response = await middleware(fakeOkResponse())({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.is(middleware.name, "composed[]");
  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(response.headers.get("X-Middleware"), null);
});

test("compose one middleware", async (t) => {
  // Arrange.

  const middleware = compose([a]);

  // Act.

  const response = await middleware(fakeOkResponse())({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.is(middleware.name, "composed[a]");
  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(response.headers.get("X-Middleware"), "a");
});

test("compose many middlewares", async (t) => {
  // Arrange.

  const middleware = compose([a, b, c]);

  // Act.

  const response = await middleware(fakeOkResponse())({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.is(middleware.name, "composed[a,b,c]");
  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(response.headers.get("X-Middleware"), "c, b, a");
});

function a(adapter: Adapter): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    const response = await adapter(request);
    const { headers } = response;
    return {
      ...response,
      headers: headers.toBuilder().append("X-Middleware", "a").build(),
    };
  };
}

function b(adapter: Adapter): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    const response = await adapter(request);
    const { headers } = response;
    return {
      ...response,
      headers: headers.toBuilder().append("X-Middleware", "b").build(),
    };
  };
}

function c(adapter: Adapter): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    const response = await adapter(request);
    const { headers } = response;
    return {
      ...response,
      headers: headers.toBuilder().append("X-Middleware", "c").build(),
    };
  };
}

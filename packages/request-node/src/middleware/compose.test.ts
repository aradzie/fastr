import { HttpHeaders } from "@webfx-http/headers";
import test from "ava";
import { FakeResponse } from "../fake/response.js";
import type { Adapter, HttpRequest, HttpResponse } from "../types.js";
import { compose } from "./compose.js";

test("compose zero middleware", async (t) => {
  // Arrange.

  const middleware = compose([]);

  // Act.

  const response = await middleware(
    {
      url: "http://test/",
      method: "GET",
    },
    FakeResponse.ok(),
  );

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

  const response = await middleware(
    {
      url: "http://test/",
      method: "GET",
    },
    FakeResponse.ok(),
  );

  // Assert.

  t.is(middleware.name, "composed[a]");
  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(response.headers.get("X-Middleware"), "a");
});

test("compose many middleware", async (t) => {
  // Arrange.

  const middleware = compose([a, b, c]);

  // Act.

  const response = await middleware(
    {
      url: "http://test/",
      method: "GET",
    },
    FakeResponse.ok(),
  );

  // Assert.

  t.is(middleware.name, "composed[a,b,c]");
  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(response.headers.get("X-Middleware"), "c, b, a");
});

async function a(
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> {
  const response = await adapter(request);
  const { headers } = response;
  return {
    ...response,
    headers: new HttpHeaders(headers).append("X-Middleware", "a"),
  };
}

async function b(
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> {
  const response = await adapter(request);
  const { headers } = response;
  return {
    ...response,
    headers: new HttpHeaders(headers).append("X-Middleware", "b"),
  };
}

async function c(
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> {
  const response = await adapter(request);
  const { headers } = response;
  return {
    ...response,
    headers: new HttpHeaders(headers).append("X-Middleware", "c"),
  };
}

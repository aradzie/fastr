import test from "ava";
import { request, useAdapter } from "./instance.js";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "./types.js";

const mw1: Middleware = (
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> => {
  return adapter({
    ...request,
    body: `${request.body};mw1`,
  });
};

const mw2: Middleware = (
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> => {
  return adapter({
    ...request,
    body: `${request.body};mw2`,
  });
};

test("request without middleware", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  useAdapter(testAdapter);

  // Act.

  const actualRes = await request({ method: "GET", url: "/", body: "body" });

  // Assert.

  t.is(actualRes, res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.deepEqual(req1, { method: "GET", url: "/", body: "body" });
});

test("build request without middleware", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  useAdapter(testAdapter);

  // Act.

  const actualRes = await request.GET("/").send("body");

  // Assert.

  t.is(actualRes, res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, "body");
});

test("request with middleware", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  useAdapter(testAdapter);

  // Act.

  const actualRes = await request.use(mw1).use(mw2)({
    method: "GET",
    url: "/",
    body: "body",
  });

  // Assert.

  t.is(actualRes, res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.deepEqual(req1, { method: "GET", url: "/", body: "body;mw2;mw1" });
});

test("build request with middleware", async (t) => {
  // Arrange.

  const receivedRequests: HttpRequest[] = [];
  const res1 = {} as HttpResponse;
  const testAdapter: Adapter = async (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    receivedRequests.push(request);
    return res1;
  };
  useAdapter(testAdapter);

  // Act.

  const actualRes = await request.use(mw1).use(mw2).GET("/").send("body");

  // Assert.

  t.is(actualRes, res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, "body;mw2;mw1");
});

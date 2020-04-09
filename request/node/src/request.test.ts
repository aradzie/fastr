import test from "ava";
import { adapter, request } from "./request";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "./types";

const mw1: Middleware = (adapter: Adapter): Adapter => {
  return (request: HttpRequest): Promise<HttpResponse> => {
    return adapter({
      ...request,
      body: `${request.body};mw1`,
    });
  };
};

const mw2: Middleware = (adapter: Adapter): Adapter => {
  return (request: HttpRequest): Promise<HttpResponse> => {
    return adapter({
      ...request,
      body: `${request.body};mw2`,
    });
  };
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
  adapter(testAdapter);

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
  adapter(testAdapter);

  // Act.

  const actualRes = await request.get("/").send("body");

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
  adapter(testAdapter);

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
  adapter(testAdapter);

  // Act.

  const actualRes = await request.use(mw1).use(mw2).get("/").send("body");

  // Assert.

  t.is(actualRes, res1);
  t.is(receivedRequests.length, 1);
  const [req1] = receivedRequests;
  t.is(req1.body, "body;mw2;mw1");
});

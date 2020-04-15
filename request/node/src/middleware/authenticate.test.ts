import test from "ava";
import { reflect } from "../fake/fakes";
import type { HttpRequest, HttpResponse } from "../types";
import { authenticate } from "./authenticate";

test("custom header value", async (t) => {
  // Arrange.

  const underTest = authenticate("xyz");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.deepEqual(await response.body.json(), {
    method: "GET",
    url: "https://test/",
    headers: { Authorization: "xyz" },
    body: null,
    options: null,
    calls: 1,
  });
});

test("basic authorization header", async (t) => {
  // Arrange.

  const underTest = authenticate.basic("username1", "password1");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.deepEqual(await response.body.json(), {
    method: "GET",
    url: "https://test/",
    headers: { Authorization: "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ==" },
    body: null,
    options: null,
    calls: 1,
  });
});

test("bearer authorization header", async (t) => {
  // Arrange.

  const underTest = authenticate.bearer("token1");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.deepEqual(await response.body.json(), {
    method: "GET",
    url: "https://test/",
    headers: { Authorization: "Bearer token1" },
    body: null,
    options: null,
    calls: 1,
  });
});

test("check that HTTPS is used", async (t) => {
  // Arrange.

  const underTest = authenticate("xyz");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      name: "TypeError",
      message: "Must use HTTPS to sent authorization headers.",
    },
  );
});

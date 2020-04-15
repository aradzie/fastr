import test from "ava";
import { fakeOkResponse } from "../fake/fakes";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { authenticate } from "./authenticate";

test("custom header value", async (t) => {
  // Arrange.

  const underTest = authenticate("xyz");
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.is(request.headers?.get("Authorization"), "xyz");
    return fakeOkResponse({})(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
});

test("basic authorization header", async (t) => {
  // Arrange.

  const underTest = authenticate.basic("username1", "password1");
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.is(
      request.headers?.get("Authorization"),
      "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ==",
    );
    return fakeOkResponse({})(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
});

test("bearer authorization header", async (t) => {
  // Arrange.

  const underTest = authenticate.bearer("token1");
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.is(request.headers?.get("Authorization"), "Bearer token1");
    return fakeOkResponse({})(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

  // Act.

  const response = await adapter({
    url: "https://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
});

test("check that HTTPS is used", async (t) => {
  // Arrange.

  const underTest = authenticate("xyz");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeOkResponse({}));

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

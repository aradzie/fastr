import test from "ava";
import { fakeOkResponse } from "../fake/fakes";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";
import { authenticate } from "./authenticate";
import { compose } from "./compose";

test("custom header value", async (t) => {
  // Arrange.

  const underTest = authenticate("xyz");
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.is(request.headers?.get("Authorization"), "xyz");
      return adapter(request);
    };
  };
  const adapter = compose([underTest, checkRequest])(fakeOkResponse({}));

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
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.is(
        request.headers?.get("Authorization"),
        "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ==",
      );
      return adapter(request);
    };
  };
  const adapter = compose([underTest, checkRequest])(fakeOkResponse({}));

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
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.is(request.headers?.get("Authorization"), "Bearer token1");
      return adapter(request);
    };
  };
  const adapter = compose([underTest, checkRequest])(fakeOkResponse({}));

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
  const adapter = underTest(fakeOkResponse({}));

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

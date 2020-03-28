import test from "ava";
import { fakeOkResponse } from "../fakes";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";
import { compose } from "./compose";
import { expectType } from "./expect-type";

test("return response if content type matches", async (t) => {
  // Arrange.

  const underTest = expectType("text/plain");
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.is(request.headers?.get("accept"), "text/plain");
      return adapter(request);
    };
  };
  const adapter = compose([underTest, checkRequest])(
    fakeOkResponse({
      headers: { "content-type": "text/plain" },
      bodyData: "text",
    }),
  );

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
});

test("throw error if content type does not match", async (t) => {
  // Arrange.

  const underTest = expectType("text/plain");
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.is(request.headers?.get("accept"), "text/plain");
      return adapter(request);
    };
  };
  const adapter = compose([underTest, checkRequest])(
    fakeOkResponse({
      headers: { "content-type": "application/json" },
      bodyData: "{}",
    }),
  );

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      name: "UnsupportedMediaTypeError",
      message: "Unsupported Media Type",
    },
  );
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = expectType("text/plain");
  const adapter = underTest(async () => {
    throw error;
  });

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      is: error,
    },
  );
});

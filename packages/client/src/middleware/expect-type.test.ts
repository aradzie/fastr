import test from "ava";
import { FakeResponse } from "../fakes/index.js";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";
import { compose } from "./compose.js";
import { expectType } from "./expect-type.js";

test("return response if content type matches", async (t) => {
  // Arrange.

  const underTest = expectType("text/plain");
  const checkRequest: Middleware = (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    t.is(request.headers?.get("accept"), "text/plain");
    return adapter(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    compose([underTest, checkRequest])(
      req,
      FakeResponse.of("text", {
        headers: { "content-type": "text/plain" },
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
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.is(request.headers?.get("accept"), "text/plain");
    return FakeResponse.of("{}", {
      headers: { "content-type": "application/json" },
    })(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      name: "HttpError [415]",
      message: "Unsupported Media Type",
    },
  );
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = expectType("text/plain");
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, async () => {
      throw error;
    });

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      is: error,
    },
  );
});

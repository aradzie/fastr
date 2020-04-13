import test from "ava";
import { fakeOkResponse } from "../fake/fakes";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";
import { compose } from "./compose";
import { defaultOptions } from "./default-options";

test("set default values", async (t) => {
  // Arrange.

  const underTest = defaultOptions({ timeout: 123 });
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.deepEqual(request.options, { timeout: 123 });
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

test("use explicit values", async (t) => {
  // Arrange.

  const underTest = defaultOptions({ timeout: 123 });
  const checkRequest: Middleware = (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      t.deepEqual(request.options, { timeout: 321 });
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
    options: {
      timeout: 321,
    },
  });

  // Assert.

  t.true(response.ok);
});

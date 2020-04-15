import test from "ava";
import { fakeOkResponse } from "../fake/fakes";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { defaultOptions } from "./default-options";

test("set default values", async (t) => {
  // Arrange.

  const underTest = defaultOptions({ timeout: 123 });
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.deepEqual(request.options, { timeout: 123 });
    return fakeOkResponse({})(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

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
  const checkRequest: Adapter = (
    request: HttpRequest,
  ): Promise<HttpResponse> => {
    t.deepEqual(request.options, { timeout: 321 });
    return fakeOkResponse({})(request);
  };
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, checkRequest);

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

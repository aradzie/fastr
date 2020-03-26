import test from "ava";
import { FakeResponse } from "../fakes/index.js";
import { type HttpRequest, type HttpResponse } from "../types.js";
import { handleErrors } from "./handle-errors.js";

test("passes through if response status is successful", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.of("ok"));

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
});

test("throw error if response status is a client error", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.from({ status: 404 }));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      name: "HttpError [404]",
      message: "Not Found",
    },
  );
});

test("throw error if response status is a server error", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.from({ status: 500 }));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      name: "HttpError [500]",
      message: "Internal Server Error",
    },
  );
});

test("throw error if response status is not successful", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.from({ status: 302 }));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      name: "TypeError",
      message: "Excepted successful HTTP status but got 302.",
    },
  );
});

test("passes through if response status is redirect", async (t) => {
  // Arrange.

  const underTest = handleErrors({ okOnly: false });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.from({ status: 302 }));

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.false(response.ok);
  t.is(response.status, 302);
  t.is(response.statusText, "Moved Temporarily");
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = handleErrors();
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

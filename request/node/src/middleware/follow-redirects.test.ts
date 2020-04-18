import { RequestRedirectError } from "@webfx-request/error";
import test from "ava";
import { FakeResponse } from "../fake/response";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { followRedirects } from "./follow-redirects";

test("pass through if response status is not redirect", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.ok({ bodyData: "found" }));

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "found");
});

test("return first response the redirect option is manual", async (t) => {
  // Arrange.

  const underTest = followRedirects({ redirect: "manual" });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.redirect(303, "http://test/another"));

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.false(response.ok);
  t.is(response.status, 303);
  t.is(response.statusText, "See Other");
  t.is(await response.body.text(), "see http://test/another");
});

test("follows redirect", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeRedirectingAdapter());

  // Act.

  const response = await adapter({
    url: "http://test/a",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "found");
});

test("throw error if the redirect option is error", async (t) => {
  // Arrange.

  const underTest = followRedirects({ redirect: "error" });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.redirect(303, "http://test/another"));

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      instanceOf: RequestRedirectError,
      message: "Redirect response detected",
    },
  );
});

test("throw error if too many redirects", async (t) => {
  // Arrange.

  const underTest = followRedirects({ follow: 2 });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeRedirectingAdapter());

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/a",
        method: "GET",
      });
    },
    {
      instanceOf: RequestRedirectError,
      message: "Too many redirects",
    },
  );
});

test("throw error if redirect loop detected", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeLoopingRedirectingAdapter());

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/a",
        method: "GET",
      });
    },
    {
      instanceOf: RequestRedirectError,
      message: "Redirect loop detected",
    },
  );
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, async () => {
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

export function fakeRedirectingAdapter(): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    switch (String(request.url)) {
      case "http://test/a":
        return FakeResponse.redirect(303, "http://test/b")(request);
      case "http://test/b":
        return FakeResponse.redirect(303, "http://test/c")(request);
      case "http://test/c":
        return FakeResponse.redirect(303, "/found")(request);
      case "http://test/found":
        return FakeResponse.ok({ bodyData: "found" })(request);
      default:
        return FakeResponse.notFound()(request);
    }
  };
}

export function fakeLoopingRedirectingAdapter(): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    switch (String(request.url)) {
      case "http://test/a":
        return FakeResponse.redirect(308, "http://test/b")(request);
      case "http://test/b":
        return FakeResponse.redirect(308, "http://test/a")(request);
      default:
        return FakeResponse.notFound()(request);
    }
  };
}

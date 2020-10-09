import { HttpHeaders } from "@webfx-http/headers";
import { RequestError } from "@webfx-request/error";
import test from "ava";
import { Readable } from "stream";
import { FakeResponse, reflect } from "../fake/response.js";
import type { Adapter, HttpRequest, HttpResponse } from "../types.js";
import { followRedirects } from "./follow-redirects.js";

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
    underTest(req, FakeResponse.redirect(301, "http://test/another"));

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.false(response.ok);
  t.is(response.status, 301);
  t.is(response.statusText, "Moved Permanently");
  t.is(await response.body.text(), "see http://test/another");
});

test("follow redirect and keep request body", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeRedirectingAdapter(308));

  // Act.

  const response = await adapter({
    url: "http://test/a",
    method: "PUT",
    headers: new HttpHeaders([
      ["Content-Type", "text/plain"],
      ["Content-Length", 5],
      ["X-Extra", "something"],
    ]),
    body: Readable.from(["hello"]),
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.deepEqual(await response.body.json(), {
    url: "http://test/found",
    method: "PUT",
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": "5",
      "X-Extra": "something",
    },
    body: "hello",
    options: null,
    calls: 1,
  });
});

test("follow redirect and discard request body", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeRedirectingAdapter(303));

  // Act.

  const response = await adapter({
    url: "http://test/a",
    method: "PUT",
    headers: new HttpHeaders([
      ["Content-Type", "text/plain"],
      ["Content-Length", 5],
      ["X-Extra", "something"],
    ]),
    body: Readable.from(["hello"]),
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.deepEqual(await response.body.json(), {
    url: "http://test/found",
    method: "GET",
    headers: {
      "X-Extra": "something",
    },
    body: null,
    options: null,
    calls: 1,
  });
});

test("throw error if the redirect option is error", async (t) => {
  // Arrange.

  const underTest = followRedirects({ redirect: "error" });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.redirect(303, "http://test/another"));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Redirect response detected",
    },
  );
});

test("throw error if too many redirects", async (t) => {
  // Arrange.

  const underTest = followRedirects({ follow: 2 });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeRedirectingAdapter(301));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
      message: "Too many redirects",
    },
  );
});

test("throw error if redirect loop detected", async (t) => {
  // Arrange.

  const underTest = followRedirects();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeLoopingRedirectingAdapter(308));

  // Assert.

  await t.throwsAsync(
    adapter({
      url: "http://test/a",
      method: "GET",
    }),
    {
      instanceOf: RequestError,
      code: "REDIRECT",
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
    adapter({
      url: "http://test/",
      method: "GET",
    }),
    {
      is: error,
    },
  );
});

export function fakeRedirectingAdapter(status: number): Adapter {
  const toB = FakeResponse.redirect(status, "http://test/b");
  const toC = FakeResponse.redirect(status, "http://test/c");
  const toFound = FakeResponse.redirect(status, "/found");
  const found = reflect();
  const notFound = FakeResponse.notFound();
  return async (request: HttpRequest): Promise<HttpResponse> => {
    switch (String(request.url)) {
      case "http://test/a":
        return toB(request);
      case "http://test/b":
        return toC(request);
      case "http://test/c":
        return toFound(request);
      case "http://test/found":
        return found(request);
      default:
        return notFound(request);
    }
  };
}

export function fakeLoopingRedirectingAdapter(status: number): Adapter {
  const toB = FakeResponse.redirect(status, "http://test/b");
  const toA = FakeResponse.redirect(status, "http://test/a");
  const notFound = FakeResponse.notFound();
  return async (request: HttpRequest): Promise<HttpResponse> => {
    switch (String(request.url)) {
      case "http://test/a":
        return toB(request);
      case "http://test/b":
        return toA(request);
      default:
        return notFound(request);
    }
  };
}

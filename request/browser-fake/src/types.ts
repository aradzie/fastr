import type { Adapter, HttpRequest } from "@webfx/browser-request";

export interface FakeAdapter extends Adapter {
  /**
   * Replaces the real adapter which the fake one which, when called with the
   * given method and URL, will return the given response.
   *
   * @param method The HTTP method to match in a request.
   * @param url The URL to match in a request.
   * @param adapter The adapter which will generate response.
   * @return Fake adapter for method chaining.
   *
   * @example
   *
   * If a test response is added like this:
   *
   * ```
   * fakeAdapter.addResponse(
   *   "GET",
   *   "/resource-url",
   *   FakeHttpResponse.body("text response", {
   *      headers: { "Content-Type": "text/plain" },
   *   }),
   * );
   * ```
   *
   * The the following call will return `"text response"` from the above:
   *
   * ```
   * const response = await request.get("/resource-url").send();
   * assert((await response.text()) === "text response");
   * ```
   */
  addResponse(
    method: string,
    url: string | RegExp,
    adapter: Adapter,
  ): FakeAdapter;

  /**
   * Clears all added test responses, reinstates the original, non-fake adapter.
   * The end result is as if the `addResponse` method has never been called.
   */
  reset(): void;
}

export interface RequestMatcher {
  (request: HttpRequest): boolean;
}

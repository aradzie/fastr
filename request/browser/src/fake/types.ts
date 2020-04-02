import type { Adapter, BodyDataType, HttpRequest } from "../types";
import type { Recorder } from "./recorder";
import type { BodyMethodInit } from "./response";

/**
 * The fake adapter extends the base interface with additional method for adding
 * fake routes and building fake responses.
 */
export interface FakeAdapter extends Adapter {
  on: RouteBuilder;

  /**
   * Provides low-level access to the fake adapter. All routes are tested in the
   * order they were added. The first route matching a request will be called to
   * generate a response.
   * @param matcher A matcher to test a request.
   * @param adapter An adapter to call to generate response
   *                if the matcher matched.
   */
  addRoute(matcher: RequestMatcher, adapter: Adapter): FakeAdapter;

  /**
   * Clears all added test routes, reinstates the original, non-fake adapter.
   * The end result is as if the `addRoute` method has never been called.
   */
  reset(): void;
}

export interface RouteBuilder {
  /**
   * Matches the given HTTP method and URL.
   * The wildcard value `"*"` can be used to match any method or URL.
   */
  (method: string, url: string | RegExp): ReplyBuilder;
  /**
   * Matches any HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  any(url: string | RegExp): ReplyBuilder;
  /**
   * Matches the `GET` HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  get(url: string | RegExp): ReplyBuilder;
  /**
   * Matches the `POST` HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  post(url: string | RegExp): ReplyBuilder;
  /**
   * Matches the `PUT` HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  put(url: string | RegExp): ReplyBuilder;
  /**
   * Matches the `PATCH` HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  patch(url: string | RegExp): ReplyBuilder;
  /**
   * Matches the `DELETE` HTTP method and the given URL.
   * The wildcard value `"*"` can be used to match any URL.
   */
  delete(url: string | RegExp): ReplyBuilder;
}

export interface ReplyBuilder {
  /** Invokes the given adapter to generate response. */
  reply(adapter: Adapter, recorder?: Recorder): FakeAdapter;
  /** Creates an adapter which replies with the given body. */
  replyWith(
    body: BodyDataType,
    init?: BodyMethodInit,
    recorder?: Recorder,
  ): FakeAdapter;
  /** Creates an adapter which throws the given error. */
  throwError(error: Error, recorder?: Recorder): FakeAdapter;
}

export interface RequestMatcher {
  (request: HttpRequest): boolean;
}

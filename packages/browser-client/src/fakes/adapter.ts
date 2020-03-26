import { useAdapter } from "../instance.js";
import {
  type Adapter,
  type BodyDataType,
  type HttpRequest,
  type HttpResponse,
} from "../types.js";
import { match } from "./match.js";
import { type Recorder } from "./recorder.js";
import { FakeHttpResponse, type FakeResponseInit } from "./response.js";
import {
  type FakeAdapter,
  type ReplyBuilder,
  type RequestMatcher,
} from "./types.js";

// TODO Better request filter.
// TODO Intercept requests to assert request parameters.
// TODO Record sent requests.
// TODO Multiple responses.
// TODO Resolved handle.

type Route = {
  readonly matcher: RequestMatcher;
  readonly adapter: Adapter;
};

const initialAdapter: Adapter = useAdapter();
const routes: Route[] = [];

export const fakeAdapter: FakeAdapter = async (
  request: HttpRequest,
): Promise<HttpResponse> => {
  const route = routes.find((v) => v.matcher(request));
  if (route != null) {
    return route.adapter(request);
  } else {
    return FakeHttpResponse.of("Not Found", {
      status: 404,
      headers: { "Content-Tye": "text/html" },
    })(request);
  }
};

const on = (method: string, url: string | RegExp): ReplyBuilder => {
  const reply = (adapter: Adapter, recorder?: Recorder): FakeAdapter => {
    if (recorder != null) {
      adapter = recorder.record(adapter);
    }
    fakeAdapter.addRoute(match(method, url), adapter);
    return fakeAdapter;
  };
  const replyWith = (
    body: BodyDataType,
    init?: Partial<Omit<FakeResponseInit, "body">>,
    recorder?: Recorder,
  ): FakeAdapter => {
    reply(FakeHttpResponse.from({ ...init, body }), recorder);
    return fakeAdapter;
  };
  const throwError = (error: Error, recorder?: Recorder): FakeAdapter => {
    reply(FakeHttpResponse.throwError(error), recorder);
    return fakeAdapter;
  };
  return { reply, replyWith, throwError };
};

on.ANY = (url: string | RegExp): ReplyBuilder => on("*", url);
on.GET = (url: string | RegExp): ReplyBuilder => on("GET", url);
on.POST = (url: string | RegExp): ReplyBuilder => on("POST", url);
on.PUT = (url: string | RegExp): ReplyBuilder => on("PUT", url);
on.PATCH = (url: string | RegExp): ReplyBuilder => on("PATCH", url);
on.DELETE = (url: string | RegExp): ReplyBuilder => on("DELETE", url);

fakeAdapter.on = on;
fakeAdapter.addRoute = (
  matcher: RequestMatcher,
  response: Adapter,
): FakeAdapter => {
  useAdapter(fakeAdapter);
  routes.push({ matcher, adapter: response });
  return fakeAdapter;
};
fakeAdapter.reset = (): void => {
  useAdapter(initialAdapter);
  routes.length = 0;
};

import { adapter } from "../request";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { match } from "./match";
import { FakeHttpResponse } from "./response";
import type { FakeAdapter, ReplyBuilder, RequestMatcher } from "./types";

// TODO Better request filter.
// TODO Record sent requests.
// TODO Multiple responses.
// TODO Resolved handle.

type Route = {
  readonly matcher: RequestMatcher;
  readonly adapter: Adapter;
};

const initialAdapter: Adapter = adapter();
const routes: Route[] = [];

export const fakeAdapter: FakeAdapter = async (
  request: HttpRequest,
): Promise<HttpResponse> => {
  const route = routes.find((v) => v.matcher(request));
  if (route != null) {
    return route.adapter(request);
  } else {
    return FakeHttpResponse.withBody("Not Found", {
      status: 404,
      headers: { "Content-Tye": "text/html" },
    })(request);
  }
};

fakeAdapter.on = on;
fakeAdapter.addRoute = addRoute;
fakeAdapter.reset = reset;

function on(method: string, url: string | RegExp): ReplyBuilder {
  return new (class implements ReplyBuilder {
    reply(adapter: Adapter): FakeAdapter {
      fakeAdapter.addRoute(match(method, url), adapter);
      return fakeAdapter;
    }
  })();
}

function addRoute(matcher: RequestMatcher, response: Adapter): FakeAdapter {
  adapter(fakeAdapter);
  routes.push({ matcher, adapter: response });
  return fakeAdapter;
}

function reset(): void {
  adapter(initialAdapter);
  routes.splice(0, routes.length);
}

on.any = onAny;
on.get = onGet;
on.post = onPost;
on.put = onPut;
on.patch = onPatch;
on.delete = onDelete;

function onAny(url: string | RegExp): ReplyBuilder {
  return on("*", url);
}

function onGet(url: string | RegExp): ReplyBuilder {
  return on("GET", url);
}

function onPost(url: string | RegExp): ReplyBuilder {
  return on("POST", url);
}

function onPut(url: string | RegExp): ReplyBuilder {
  return on("PUT", url);
}

function onPatch(url: string | RegExp): ReplyBuilder {
  return on("PATCH", url);
}

function onDelete(url: string | RegExp): ReplyBuilder {
  return on("DELETE", url);
}

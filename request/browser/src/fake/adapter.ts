import { adapter } from "../request";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { FakeHttpResponse } from "./response";
import type { FakeAdapter } from "./types";

// TODO Better request filter.
// TODO Record sent requests.
// TODO Resolved handle.

const initialAdapter: Adapter = adapter();
const responses: ExpectedResponse[] = [];

export const fakeAdapter: FakeAdapter = async (
  request: HttpRequest,
): Promise<HttpResponse> => {
  const response = responses.find((v) => v.matches(request));
  if (response != null) {
    return response.adapter(request);
  } else {
    return FakeHttpResponse.body("Not Found", {
      status: 404,
      headers: { "Content-Tye": "text/html" },
    })(request);
  }
};

fakeAdapter.addResponse = addResponse;
fakeAdapter.reset = reset;

function addResponse(
  method: string,
  url: string | RegExp,
  response: Adapter,
): FakeAdapter {
  adapter(fakeAdapter);
  responses.push(new ExpectedResponse(method, url, response));
  return fakeAdapter;
}

function reset(): void {
  adapter(initialAdapter);
  responses.splice(0, responses.length);
}

export class ExpectedResponse {
  readonly method: string;
  readonly url: string | RegExp;
  readonly adapter: Adapter;

  constructor(method: string, url: string | RegExp, adapter: Adapter) {
    this.method = method;
    this.url = url;
    this.adapter = adapter;
  }

  matches({ method, url }: HttpRequest): boolean {
    if (
      this.method === "*" ||
      this.method.toUpperCase() === method.toUpperCase()
    ) {
      if (typeof this.url === "string") {
        return this.url === url;
      } else {
        return this.url.test(url);
      }
    } else {
      return false;
    }
  }
}

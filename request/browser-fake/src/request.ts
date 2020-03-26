import { HttpRequest, HttpResponse, request } from "@webfx/browser-request";

export interface FakeRequest {
  readonly request: HttpRequest;
}

export class ExpectedResponse {
  readonly method: string;
  readonly url: string | RegExp;
  readonly response: HttpResponse;

  constructor(method: string, url: string | RegExp, response: HttpResponse) {
    this.method = method;
    this.url = url;
    this.response = response;
  }

  matches(method: string, url: string): boolean {
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

const responses: ExpectedResponse[] = [];
const requests: FakeRequest[] = [];
let lastAdapter = request.adapter();

/**
 * Creates a new fake response for the specified HTTP method and URL.
 *
 * @param method A HTTP method of request.
 * @param url a request URL.
 * @param response The response to provide for the specified HTTP method and URL.
 */
export function fakeRequest(
  method: string,
  url: string | RegExp,
  response: HttpResponse,
): void {
  const currentAdapter = request.adapter(fakeAdapter);
  if (currentAdapter !== fakeAdapter) {
    lastAdapter = currentAdapter;
  }
  responses.push(new ExpectedResponse(method, url, response));
}

/**
 * Returns array of all sent requests.
 */
function sent(): readonly FakeRequest[] {
  return requests;
}

fakeRequest.sent = sent;

/**
 * Clears all sent requests and fake responses,
 * reinstates the real request implementation.
 */
function reset(): void {
  // Clear pre-programmed responses.
  responses.splice(0, responses.length);

  // Clear sent requests.
  requests.splice(0, requests.length);

  // Restore the real implementation.
  request.adapter(lastAdapter);
}

fakeRequest.reset = reset;

async function fakeAdapter(request: HttpRequest): Promise<HttpResponse> {
  const { method, url } = request;
  const result = responses.find((v) => v.matches(method, String(url))) ?? null;
  if (result == null) {
    throw new Error(
      `Unknown request for HTTP method [${method}] and URL [${url}]`,
    );
  } else {
    return result.response;
  }
}

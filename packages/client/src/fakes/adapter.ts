import { type Adapter, type HttpRequest, type HttpResponse } from "../types.js";
import { FakeResponse } from "./response.js";

/**
 * Creates an adapter which responds with request description. The generated
 * response body is a JSON object whose properties are copies of request
 * properties such as url, method, headers, etc.
 */
export function reflect(): Adapter {
  let calls = 0;
  return async (request: HttpRequest): Promise<HttpResponse> => {
    calls += 1;
    const { url, method, headers, body, options } = request;
    return new FakeResponse({
      url: request.url,
      body: {
        url,
        method,
        headers: headers?.toJSON() ?? {},
        body: body != null ? String(body) : null,
        options: options ?? null,
        calls,
      },
    });
  };
}

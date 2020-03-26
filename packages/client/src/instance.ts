import { requestAdapter } from "./adapter.js";
import { RequestBuilder } from "./builder.js";
import {
  type Adapter,
  type BuildableRequest,
  type HttpRequest,
  type HttpResponse,
} from "./types.js";

let currentAdapter: Adapter = requestAdapter;

export const request: BuildableRequest = RequestBuilder.extend(
  (request: HttpRequest): Promise<HttpResponse> => {
    return currentAdapter(request);
  },
);

/**
 * Returns the current adapter.
 */
export function adapter(): Adapter;

/**
 * Returns the current adapter and replaces it with the given one.
 */
export function adapter(newAdapter: Adapter): Adapter;

export function adapter(newAdapter?: Adapter): Adapter {
  const result = currentAdapter;
  if (newAdapter != null) {
    currentAdapter = newAdapter;
  }
  return result;
}

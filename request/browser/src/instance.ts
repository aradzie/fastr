import { xhrAdapter } from "./adapter/xhr";
import { RequestBuilder } from "./builder";
import type {
  Adapter,
  BuildableRequest,
  HttpRequest,
  HttpResponse,
} from "./types";

let currentAdapter: Adapter = xhrAdapter;

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

import { URLSearchParams } from "./url.js";

/**
 * Merges query string from the given URL and the given list of values.
 * @param url The original URL. It may already have query string parameters.
 * @param params Any additional parameters to add to the URL.
 *               It can be any iterable of tuples,
 *               such as `URLSearchParams`, `Map<string, unknown>`,
 *               `Array<[string, unknown]>`, etc.
 * @return Updated URL.
 */
export function mergeSearchParams(
  url: string,
  params: Iterable<readonly [string, unknown]>,
): string {
  const entries = Array.isArray(params) ? params : [...params];
  if (entries.length === 0) {
    return url;
  }
  let base;
  let q;
  const i = url.indexOf("?");
  if (i !== -1) {
    base = url.substring(0, i);
    q = new URLSearchParams(url.substring(i + 1));
  } else {
    base = url;
    q = new URLSearchParams();
  }
  for (const [name, value] of entries) {
    q.append(name, String(value));
  }
  return `${base}?${q}`;
}

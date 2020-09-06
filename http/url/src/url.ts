import { URLSearchParams } from "@webfx/url";
import type { UrlParams } from "./types";

export function toUrl(
  template: string,
  { params, query }: UrlParams = {},
): string {
  let base: string;
  let q: URLSearchParams | null;

  const index = template.indexOf("?");
  if (index !== -1) {
    base = template.substring(0, index);
    q = new URLSearchParams(template.substring(index + 1));
  } else {
    base = template;
    q = null;
  }

  if (base.indexOf("{") !== -1) {
    base = split(base)
      .map((segment) => {
        if (typeof segment === "string") {
          return segment;
        } else {
          const { name } = segment;
          let value: any;
          if (params == null || (value = valueOf(params, name)) == null) {
            throw new Error(`Missing path parameter [${name}]`);
          }
          return encodeURIComponent(String(value));
        }
      })
      .join("");
  }

  if (query != null) {
    for (const [name, value] of entriesOf(query)) {
      if (q == null) {
        q = new URLSearchParams();
      }
      q.append(name, value);
    }
  }

  if (q != null) {
    return base + "?" + q;
  } else {
    return base;
  }
}

function entriesOf(
  map: Map<string, any> | Record<string, any>,
): Iterable<[string, any]> {
  if (map instanceof Map) {
    return map.entries();
  } else {
    return Object.entries(map);
  }
}

function valueOf(
  map: Map<string, any> | Record<string, any>,
  key: string,
): any {
  if (map instanceof Map) {
    return map.get(key);
  } else {
    return map[key];
  }
}

type Segment = string | { readonly name: string };

function split(path: string): readonly Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  while (true) {
    const begin = path.indexOf("{", last);
    if (begin === -1) {
      break;
    }
    const end = path.indexOf("}", begin + 1);
    if (end === -1) {
      break;
    }
    if (begin > last) {
      segments.push(path.substring(last, begin));
    }
    const name = path.substring(begin + 1, end);
    segments.push({ name });
    last = end + 1;
  }
  if (last < path.length) {
    segments.push(path.substring(last));
  }
  return segments;
}

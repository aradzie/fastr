import { URL } from "url";

export function toURL(url: URL | string): URL {
  if (typeof url === "string") {
    return new URL(url);
  } else {
    return url;
  }
}

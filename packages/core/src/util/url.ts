import { BadRequestError } from "@fastr/errors";

export interface RequestURL {
  url: string;
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  path: string;
  querystring: string;
  query: URLSearchParams;
}

export function parseRequestURL(url: string, origin: string): RequestURL {
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
  try {
    if (url.startsWith("/")) {
      const p = new URL(`${origin}${url}`);
      return {
        url,
        href: p.href,
        origin: p.origin,
        protocol: p.protocol.substring(0, p.protocol.length - 1),
        host: p.host,
        hostname: p.hostname,
        path: p.pathname,
        querystring: p.search.substring(1),
        query: new URLSearchParams(p.searchParams),
      };
    } else {
      const p = new URL(origin);
      return {
        url,
        href: "",
        origin: p.origin,
        protocol: p.protocol.substring(0, p.protocol.length - 1),
        host: p.host,
        hostname: p.hostname,
        path: "",
        querystring: "",
        query: new URLSearchParams(),
      };
    }
  } catch (err) {
    throw new BadRequestError("Invalid URL");
  }
}

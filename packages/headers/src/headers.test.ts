import test from "ava";
import { Accept } from "./accept.js";
import { AcceptEncoding } from "./accept-encoding.js";
import { AcceptLanguage } from "./accept-language.js";
import { CacheControl } from "./cache-control.js";
import { ContentLength } from "./content-length.js";
import { ContentType } from "./content-type.js";
import { Cookie } from "./cookie.js";
import { ETag } from "./etag.js";
import { Forwarded } from "./forwarded.js";
import { type HeaderClass, isHeaderClass } from "./headers.js";
import { IfMatch } from "./if-match.js";
import { IfNoneMatch } from "./if-none-match.js";
import { Link } from "./link.js";
import { RequestCacheControl } from "./request-cache-control.js";
import { SetCookie } from "./set-cookie.js";
import { Upgrade } from "./upgrade.js";
import { Vary } from "./vary.js";

const headers: readonly HeaderClass<any>[] = [
  Accept,
  AcceptEncoding,
  AcceptLanguage,
  CacheControl,
  ContentLength,
  ContentType,
  Cookie,
  ETag,
  Forwarded,
  IfMatch,
  IfNoneMatch,
  Link,
  RequestCacheControl,
  SetCookie,
  Upgrade,
  Vary,
];

test("basic checks", (t) => {
  for (const header of headers) {
    isHeaderClass(header);
    t.not(header.headerName, header.headerNameLc);
    t.is(header.headerName.toLowerCase(), header.headerNameLc);
    t.is(header.headerNameLc.toLowerCase(), header.headerNameLc);
  }
});

test("is header class", (t) => {
  t.false(isHeaderClass(undefined));
  t.false(isHeaderClass(null));
  t.false(isHeaderClass(0));
  t.false(isHeaderClass(true));
  t.false(isHeaderClass(""));
  t.false(isHeaderClass({}));
  t.false(isHeaderClass([]));
  t.false(isHeaderClass([]));
  t.false(isHeaderClass(class Foo {}));
  t.true(isHeaderClass(Cookie));
  t.true(isHeaderClass(SetCookie));
});

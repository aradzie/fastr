import test from "ava";
import { type IncomingHttpHeaders, type IncomingMessage } from "http";
import { Request } from "./request.js";

test("request url", (t) => {
  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "*",
        method: "OPTIONS",
      } as IncomingMessage,
      { behindProxy: false },
    ),
    {
      method: "OPTIONS",
      url: "*",
      href: "",
      origin: "http://abc:123",
      protocol: "http",
      host: "abc:123",
      hostname: "abc",
      path: "",
      querystring: "",
      query: new URLSearchParams(),
    },
  );

  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "http://uvw/path?a=1",
        method: "GET",
      } as IncomingMessage,
      { behindProxy: false },
    ),
    {
      method: "GET",
      url: "http://uvw/path?a=1",
      href: "",
      origin: "http://abc:123",
      protocol: "http",
      host: "abc:123",
      hostname: "abc",
      path: "",
      querystring: "",
      query: new URLSearchParams(),
    },
  );

  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "//a//.//b//.//c//?x=1",
        method: "GET",
      } as IncomingMessage,
      { behindProxy: false },
    ),
    {
      method: "GET",
      url: "//a//.//b//.//c//?x=1",
      href: "http://abc:123//a///b///c//?x=1",
      origin: "http://abc:123",
      protocol: "http",
      host: "abc:123",
      hostname: "abc",
      path: "//a///b///c//",
      querystring: "x=1",
      query: new URLSearchParams({ x: "1" }),
    },
  );
});

test("request url when behind proxy", (t) => {
  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "*",
        method: "OPTIONS",
      } as IncomingMessage,
      { behindProxy: true },
    ),
    {
      method: "OPTIONS",
      url: "*",
      href: "",
      origin: "https://xyz:789",
      protocol: "https",
      host: "xyz:789",
      hostname: "xyz",
      path: "",
      querystring: "",
      query: new URLSearchParams(),
    },
  );

  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "http://uvw/path?a=1",
        method: "GET",
      } as IncomingMessage,
      { behindProxy: true },
    ),
    {
      method: "GET",
      url: "http://uvw/path?a=1",
      href: "",
      origin: "https://xyz:789",
      protocol: "https",
      host: "xyz:789",
      hostname: "xyz",
      path: "",
      querystring: "",
      query: new URLSearchParams(),
    },
  );

  t.like(
    new Request(
      {
        socket: {},
        headers: {
          "host": "abc:123",
          "x-forwarded-host": "xyz:789",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
        url: "//a//.//b//.//c//?x=1",
        method: "GET",
      } as IncomingMessage,
      { behindProxy: true },
    ),
    {
      method: "GET",
      url: "//a//.//b//.//c//?x=1",
      href: "https://xyz:789//a///b///c//?x=1",
      origin: "https://xyz:789",
      protocol: "https",
      host: "xyz:789",
      hostname: "xyz",
      path: "//a///b///c//",
      querystring: "x=1",
      query: new URLSearchParams({ x: "1" }),
    },
  );
});

test("empty body", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        host: "host",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.false(request.hasBody);
  t.is(request.contentType, null);
  t.is(request.contentLength, null);
  t.is(request.is("text/plain"), false);
  t.is(request.is("*/*"), false);
});

test("unknown body type and length", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "transfer-encoding": "chunked",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.hasBody);
  t.is(request.contentType, null);
  t.is(request.contentLength, null);
  t.is(request.is("text/plain"), false);
  t.is(request.is("*/*"), false);
});

test("known body type and length", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "content-type": "text/plain; charset=UTF-8",
        "content-length": "100",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.hasBody);
  t.is(request.contentType, "text/plain");
  t.is(request.contentLength, 100);
  t.is(request.is("text/plain"), "text/plain");
  t.is(request.is("TEXT/PLAIN"), "TEXT/PLAIN");
  t.is(request.is("text/*"), "text/*");
  t.is(request.is("TEXT/*"), "TEXT/*");
  t.is(request.is("*/*"), "*/*");
  t.is(request.is("text/html"), false);
  t.is(request.is("application/json"), false);
  t.is(request.is("text/html", "application/json"), false);
  t.is(request.is("text/html", "application/json", "text/plain"), "text/plain");
  t.is(request.is("text/html", "application/json", "*/*"), "*/*");
});

test("negotiate with empty headers", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "content-type": "text/plain; charset=UTF-8",
        "content-length": "100",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.acceptsType("aa/xx"));
  t.true(request.acceptsType("bb/yy"));
  t.is(request.negotiateType("aa/xx", "bb/yy"), "aa/xx");
  t.is(request.negotiateType("bb/yy", "aa/xx"), "bb/yy");

  t.true(request.acceptsEncoding("aa"));
  t.true(request.acceptsEncoding("bb"));
  t.is(request.negotiateEncoding("aa", "bb"), "aa");
  t.is(request.negotiateEncoding("bb", "aa"), "bb");

  t.true(request.acceptsLanguage("aa"));
  t.true(request.acceptsLanguage("bb"));
  t.is(request.negotiateLanguage("aa", "bb"), "aa");
  t.is(request.negotiateLanguage("bb", "aa"), "bb");
});

test("negotiate with non-empty headers", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "content-type": "text/plain; charset=UTF-8",
        "content-length": "100",
        "accept": "aa/xx, bb/yy",
        "accept-language": "aa, bb",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.acceptsType("aa/xx"));
  t.true(request.acceptsType("bb/yy"));
  t.false(request.acceptsType("cc/zz"));
  t.is(request.negotiateType("aa/xx", "bb/yy", "cc/zz"), "aa/xx");
  t.is(request.negotiateType("bb/yy", "aa/xx", "cc/zz"), "aa/xx");
  t.is(request.negotiateType("cc/zz", "bb/yy", "aa/xx"), "aa/xx");

  t.true(request.acceptsLanguage("aa"));
  t.true(request.acceptsLanguage("bb"));
  t.false(request.acceptsLanguage("cc"));
  t.is(request.negotiateLanguage("aa", "bb", "cc"), "aa");
  t.is(request.negotiateLanguage("bb", "aa", "cc"), "aa");
  t.is(request.negotiateLanguage("cc", "bb", "aa"), "aa");
});

test("negotiate with invalid non-empty headers", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "content-type": "text/plain; charset=UTF-8",
        "content-length": "100",
        "accept": "foo/bar; q",
        "accept-language": "foo; q",
      } as IncomingHttpHeaders,
      url: "/",
      method: "GET",
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.acceptsType("aa/xx"));
  t.true(request.acceptsType("bb/yy"));
  t.true(request.acceptsType("cc/zz"));
  t.is(request.negotiateType("aa/xx", "bb/yy", "cc/zz"), "aa/xx");
  t.is(request.negotiateType("bb/yy", "aa/xx", "cc/zz"), "bb/yy");
  t.is(request.negotiateType("cc/zz", "bb/yy", "aa/xx"), "cc/zz");

  t.true(request.acceptsLanguage("aa"));
  t.true(request.acceptsLanguage("bb"));
  t.true(request.acceptsLanguage("cc"));
  t.is(request.negotiateLanguage("aa", "bb", "cc"), "aa");
  t.is(request.negotiateLanguage("bb", "aa", "cc"), "bb");
  t.is(request.negotiateLanguage("cc", "bb", "aa"), "cc");
});

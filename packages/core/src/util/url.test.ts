import { BadRequestError } from "@fastr/errors";
import test from "ava";
import { parseRequestURL } from "./url.js";

test("parse request URL", (t) => {
  t.deepEqual(parseRequestURL("*", "http://xyz:123"), {
    url: "*",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "",
    path: "",
    protocol: "http",
    querystring: "",
    query: new URLSearchParams(),
  });

  t.deepEqual(parseRequestURL("uvw:80", "http://xyz:123"), {
    url: "uvw:80",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "",
    path: "",
    protocol: "http",
    querystring: "",
    query: new URLSearchParams(),
  });

  t.deepEqual(parseRequestURL("http://uvw/path?a=1", "http://xyz:123"), {
    url: "http://uvw/path?a=1",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "",
    path: "",
    protocol: "http",
    querystring: "",
    query: new URLSearchParams(),
  });

  t.deepEqual(parseRequestURL("/", "http://xyz:123"), {
    url: "/",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123/",
    path: "/",
    protocol: "http",
    querystring: "",
    query: new URLSearchParams(),
  });

  t.deepEqual(parseRequestURL("/a", "http://xyz:123"), {
    url: "/a",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123/a",
    path: "/a",
    protocol: "http",
    querystring: "",
    query: new URLSearchParams(),
  });

  t.deepEqual(parseRequestURL("//a//./b//./c/../?x=1", "http://xyz:123"), {
    url: "//a//./b//./c/../?x=1",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123//a//b//?x=1",
    path: "//a//b//",
    protocol: "http",
    querystring: "x=1",
    query: new URLSearchParams({ x: "1" }),
  });

  t.deepEqual(parseRequestURL("/../../a/?x=1", "http://xyz:123"), {
    url: "/../../a/?x=1",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123/a/?x=1",
    path: "/a/",
    protocol: "http",
    querystring: "x=1",
    query: new URLSearchParams({ x: "1" }),
  });

  t.deepEqual(parseRequestURL("/%/%%/%%%?x=1", "http://xyz:123"), {
    url: "/%/%%/%%%?x=1",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123/%/%%/%%%?x=1",
    path: "/%/%%/%%%",
    protocol: "http",
    querystring: "x=1",
    query: new URLSearchParams({ x: "1" }),
  });

  t.deepEqual(parseRequestURL("/%61/%62/%63?x=1", "http://xyz:123"), {
    url: "/%61/%62/%63?x=1",
    origin: "http://xyz:123",
    host: "xyz:123",
    hostname: "xyz",
    href: "http://xyz:123/%61/%62/%63?x=1",
    path: "/%61/%62/%63",
    protocol: "http",
    querystring: "x=1",
    query: new URLSearchParams({ x: "1" }),
  });

  t.deepEqual(
    parseRequestURL("/file%3A%2F%2F%2Fetc%2Fpasswd?x=1", "http://xyz:123"),
    {
      url: "/file%3A%2F%2F%2Fetc%2Fpasswd?x=1",
      origin: "http://xyz:123",
      host: "xyz:123",
      hostname: "xyz",
      href: "http://xyz:123/file%3A%2F%2F%2Fetc%2Fpasswd?x=1",
      path: "/file%3A%2F%2F%2Fetc%2Fpasswd",
      protocol: "http",
      querystring: "x=1",
      query: new URLSearchParams({ x: "1" }),
    },
  );

  t.throws(
    () => {
      parseRequestURL("/", "http://:80");
    },
    { instanceOf: BadRequestError, message: "Invalid URL" },
  );
});

import { BadRequestError } from "@fastr/errors";
import test from "ava";
import { normalizeUriPath } from "./path.js";

test("safe simple paths", (t) => {
  t.is(normalizeUriPath("/"), "/");
  t.is(normalizeUriPath("/x"), "/x");
  t.is(normalizeUriPath("/x/"), "/x/");
  t.is(normalizeUriPath("/x/y"), "/x/y");
  t.is(normalizeUriPath("/x/y/"), "/x/y/");
  t.is(normalizeUriPath("/xyz"), "/xyz");
  t.is(normalizeUriPath("/xyz/"), "/xyz/");
  t.is(normalizeUriPath("/.x"), "/.x");
  t.is(normalizeUriPath("/x."), "/x.");
  t.is(normalizeUriPath("/x.y"), "/x.y");
  t.is(normalizeUriPath("/x.."), "/x..");
  t.is(normalizeUriPath("/..x"), "/..x");
  t.is(normalizeUriPath("/x..y"), "/x..y");
});

test("safe percent-encoded paths", (t) => {
  t.is(normalizeUriPath("/%78/%79/%7A"), "/x/y/z");
  t.is(normalizeUriPath("/%F0%9F%8D%AC"), "/\u{0001F36C}");
});

test("safe paths with empty segments", (t) => {
  t.is(normalizeUriPath("/./."), "/./.");
  t.is(normalizeUriPath("/././"), "/././");
  t.is(normalizeUriPath("/././x"), "/././x");
  t.is(normalizeUriPath("/./x/."), "/./x/.");
  t.is(normalizeUriPath("///"), "///");
  t.is(normalizeUriPath("///x"), "///x");
  t.is(normalizeUriPath("///x///"), "///x///");
});

test("invalid percent-encoded paths", (t) => {
  t.throws(
    () => {
      normalizeUriPath("/%");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/%1");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/%XX");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/%whatever");
    },
    { instanceOf: BadRequestError },
  );
});

test("unsafe paths with relative segments", (t) => {
  t.throws(
    () => {
      normalizeUriPath("/..");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("../");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/../");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x/../y/");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x%2Fy%2Fz"); // "/x/y/z"
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("/%2E%2E/passwords.txt"); // "/../passwords.txt"
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("file%3A%2F%2F%2Fetc%2Fpasswd"); // "file:///etc/passwd"
    },
    { instanceOf: BadRequestError },
  );
});

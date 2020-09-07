import { BadRequestError, ForbiddenError } from "@webfx-http/error";
import test from "ava";
import { normalizeUriPath } from "./path.js";

test("normal paths", (t) => {
  t.is(normalizeUriPath("/"), "/");
  t.is(normalizeUriPath("/x"), "/x");
  t.is(normalizeUriPath("/x/"), "/x/");
  t.is(normalizeUriPath("/x/y"), "/x/y");
  t.is(normalizeUriPath("/x/y/"), "/x/y/");
  t.is(normalizeUriPath("/x/y/z"), "/x/y/z");
  t.is(normalizeUriPath("/x/y/z/"), "/x/y/z/");
  t.is(normalizeUriPath("/xy"), "/xy");
  t.is(normalizeUriPath("/xy/"), "/xy/");
  t.is(normalizeUriPath("/xyz"), "/xyz");
  t.is(normalizeUriPath("/xyz/"), "/xyz/");
  t.is(normalizeUriPath("/.x"), "/.x");
  t.is(normalizeUriPath("/x."), "/x.");
  t.is(normalizeUriPath("/x.y"), "/x.y");
  t.is(normalizeUriPath("/x.y.z"), "/x.y.z");
  t.is(normalizeUriPath("/x.."), "/x..");
  t.is(normalizeUriPath("/..x"), "/..x");
  t.is(normalizeUriPath("/x..y"), "/x..y");
  t.is(normalizeUriPath("/x..y..z"), "/x..y..z");
  t.is(normalizeUriPath("/%78/%79/%7A"), "/x/y/z");
  t.is(normalizeUriPath("%2Fx%2Fy%2Fz"), "/x/y/z");
  t.is(normalizeUriPath("%2F%78%2F%79%2F%7A"), "/x/y/z");
  t.is(normalizeUriPath("/%F0%9F%8D%AC"), "/\u{0001F36C}");
});

test("empty segments", (t) => {
  t.is(normalizeUriPath("/."), "/");
  t.is(normalizeUriPath("/./"), "/");
  t.is(normalizeUriPath("/./x"), "/x");
  t.is(normalizeUriPath("/./x/."), "/x/");
  t.is(normalizeUriPath("/./."), "/");
  t.is(normalizeUriPath("/././"), "/");
  t.is(normalizeUriPath("/././x"), "/x");
  t.is(normalizeUriPath("/././x/."), "/x/");
  t.is(normalizeUriPath("/././x/./"), "/x/");
  t.is(normalizeUriPath("/././x/./."), "/x/");
  t.is(normalizeUriPath("//"), "/");
  t.is(normalizeUriPath("//x"), "/x");
  t.is(normalizeUriPath("//x//"), "/x/");
  t.is(normalizeUriPath("///"), "/");
  t.is(normalizeUriPath("///x"), "/x");
  t.is(normalizeUriPath("///x///"), "/x/");
  t.is(normalizeUriPath("/%2E/%2E/x/%2E/%2E"), "/x/");
  t.is(normalizeUriPath("%2F%2F%2Fx%2F%2F%2F"), "/x/");
});

test("relative segments", (t) => {
  t.is(normalizeUriPath("/x/.."), "/");
  t.is(normalizeUriPath("/x/../y"), "/y");
  t.is(normalizeUriPath("/x/../y/"), "/y/");
  t.is(normalizeUriPath("/x/../y/.."), "/");
  t.is(normalizeUriPath("/x/../y/../"), "/");
  t.is(normalizeUriPath("/x/y/../.."), "/");
  t.is(normalizeUriPath("/x/y/../../"), "/");
  t.is(normalizeUriPath("/x/y/../../z"), "/z");
  t.is(normalizeUriPath("/x/y/../../z/"), "/z/");
  t.is(normalizeUriPath("%2Fx%2Fy%2F%2E%2E%2F%2E%2E%2Fz%2F"), "/z/");
});

test("invalid paths", (t) => {
  t.throws(
    () => {
      normalizeUriPath("");
    },
    { instanceOf: BadRequestError },
  );
  t.throws(
    () => {
      normalizeUriPath("x");
    },
    { instanceOf: BadRequestError },
  );
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
      normalizeUriPath("/..");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/../");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x/../..");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x/../../");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x/../y/../..");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/x/../y/../../");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/..");
    },
    { instanceOf: ForbiddenError },
  );
  t.throws(
    () => {
      normalizeUriPath("/%2E%2E/");
    },
    { instanceOf: ForbiddenError },
  );
});

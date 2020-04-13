import test from "ava";
import { Accept } from "./accept";
import { CacheControl } from "./cache-control";
import { Cookie } from "./cookie";
import { ETag } from "./etag";
import { Headers } from "./headers";
import { Link } from "./link";
import { MimeType } from "./mimetype";
import { SetCookie } from "./set-cookie";

test("build headers", (t) => {
  const headers = Headers.builder()
    .set("foo", "a")
    .set("Foo", "b")
    .set("FOO", "c")
    .append("bar", "a")
    .append("Bar", "b")
    .append("BAR", "c")
    .build();

  t.is(headers.get("foo"), "c");
  t.deepEqual(headers.getAll("foo"), ["c"]);
  t.is(headers.get("bar"), "a, b, c");
  t.deepEqual(headers.getAll("bar"), ["a, b, c"]);
  t.false(headers.has("baz"));
  t.is(headers.get("baz"), null);
  t.deepEqual(headers.getAll("baz"), []);

  const copy = headers.toBuilder().set("baz", "d").build();

  t.is(copy.get("foo"), "c");
  t.deepEqual(copy.getAll("foo"), ["c"]);
  t.is(copy.get("bar"), "a, b, c");
  t.deepEqual(copy.getAll("bar"), ["a, b, c"]);
  t.is(copy.get("baz"), "d");
  t.deepEqual(copy.getAll("baz"), ["d"]);
});

test("from headers", (t) => {
  const headers = Headers.from(
    Headers.builder().set("foo", "1").set("bar", "2").build(),
  );
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("from map", (t) => {
  const headers = Headers.from(
    new Map([
      ["foo", 1],
      ["bar", 2],
    ]),
  );
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("from record", (t) => {
  const headers = Headers.from({
    foo: "1",
    bar: 2,
  });
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("from entries", (t) => {
  const headers = Headers.from([
    ["foo", 1],
    ["bar", 2],
  ]);
  t.deepEqual(
    [...headers],
    [
      ["foo", "1"],
      ["bar", "2"],
    ],
  );
});

test("spread", (t) => {
  const headers = Headers.builder().set("foo", "a").append("bar", "b").build();
  t.deepEqual({ ...headers }, {});
  t.deepEqual(
    [...headers],
    [
      ["foo", "a"],
      ["bar", "b"],
    ],
  );
  t.deepEqual(Object.fromEntries(headers), {
    foo: "a",
    bar: "b",
  });
});

test("toJSON", (t) => {
  const headers = Headers.builder()
    .contentLength(123)
    .contentType("text/plain")
    .accept(new Accept(["text/plain", "*/*"]))
    .cacheControl(
      new CacheControl({
        noCache: true,
        noStore: true,
        maxAge: 123,
      }),
    )
    .appendCookie(new Cookie("cookie1", "value1"))
    .appendCookie(new Cookie("cookie2", "value2"))
    .appendSetCookie(new SetCookie("set-cookie1", "value1"))
    .appendSetCookie(new SetCookie("set-cookie2", "value2"))
    .appendLink(new Link("http://foo/"))
    .appendLink(new Link("http://bar/"))
    .build();

  t.deepEqual(headers.toJSON(), {
    "Content-Length": "123",
    "Content-Type": "text/plain",
    "Accept": "text/plain, */*",
    "Cache-Control": "no-cache, no-store, max-age=123",
    "Cookie": ["cookie1=value1", "cookie2=value2"],
    "Set-Cookie": ["set-cookie1=value1", "set-cookie2=value2"],
    "Link": ["<http://foo/>", "<http://bar/>"],
  });
});

test("toString", (t) => {
  const headers = Headers.builder()
    .contentLength(123)
    .contentType("text/plain")
    .accept(new Accept([new MimeType("text", "plain"), new MimeType("*", "*")]))
    .appendCookie(new Cookie("cookie1", "value1"))
    .appendCookie(new Cookie("cookie2", "value2"))
    .appendLink(new Link("http://foo/"))
    .appendLink(new Link("http://bar/"))
    .build();

  t.is(
    headers.toString(),
    "Content-Length: 123\n" +
      "Content-Type: text/plain\n" +
      "Accept: text/plain, */*\n" +
      "Cookie: cookie1=value1\n" +
      "Cookie: cookie2=value2\n" +
      "Link: <http://foo/>\n" +
      "Link: <http://bar/>\n",
  );
});

test("parse", (t) => {
  t.deepEqual(Headers.parse("").toJSON(), {});
  t.deepEqual(Headers.parse("\n").toJSON(), {});
  t.deepEqual(Headers.parse("foo: a").toJSON(), {
    foo: "a",
  });
  t.deepEqual(Headers.parse("foo: a\n").toJSON(), {
    foo: "a",
  });
  t.deepEqual(Headers.parse("foo: a\nbar: b:c=d").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(Headers.parse("\nfoo:  a  \nbar:b:c=d  \n\n").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(
    Headers.parse(
      "Date: Thu, 01 Jan 1970 00:00:01 GMT\n" +
        "Accept: image/png\n" +
        "Accept: image/*\n" +
        "Cache-Control: no-cache\n" +
        "Cache-Control: no-store\n" +
        "Cookie: a=1\n" +
        "Cookie: b=2\n" +
        "Set-Cookie: c=3\n" +
        "Set-Cookie: d=4\n",
    ).toJSON(),
    {
      "Date": "Thu, 01 Jan 1970 00:00:01 GMT",
      "Accept": "image/png, image/*",
      "Cache-Control": "no-cache, no-store",
      "Cookie": ["a=1", "b=2"],
      "Set-Cookie": ["c=3", "d=4"],
    },
  );
});

test("stringify and parse values", (t) => {
  const headers = Headers.builder()
    .set("Content-Length", "123")
    .set("Content-Type", "text/plain")
    .set("Content-Encoding", "gzip")
    .cacheControl("private, no-cache, no-store")
    .etag('W/"etag1"')
    .ifMatch('W/"etag2"')
    .ifNoneMatch('W/"etag3"')
    .lastModified(new Date(1000))
    .ifModifiedSince(new Date(2000))
    .ifUnmodifiedSince(new Date(3000))
    .build();

  t.is(headers.get("Content-Length"), "123");
  t.is(headers.contentLength(), 123);

  t.is(headers.get("Content-Type"), "text/plain");
  t.deepEqual(headers.contentType(), new MimeType("text", "plain"));

  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.contentEncoding(), "gzip");

  t.is(headers.get("Cache-Control"), "private, no-cache, no-store");
  t.deepEqual(
    headers.cacheControl(),
    new CacheControl({ isPrivate: true, noCache: true, noStore: true }),
  );

  t.is(headers.get("ETag"), 'W/"etag1"');
  t.deepEqual(headers.etag(), new ETag("etag1", true));

  t.is(headers.get("If-Match"), 'W/"etag2"');
  t.deepEqual(headers.ifMatch(), new ETag("etag2", true));

  t.is(headers.get("If-None-Match"), 'W/"etag3"');
  t.deepEqual(headers.ifNoneMatch(), new ETag("etag3", true));

  t.is(headers.get("Last-Modified"), "Thu, 01 Jan 1970 00:00:01 GMT");
  t.deepEqual(headers.lastModified(), new Date(1000));

  t.is(headers.get("If-Modified-Since"), "Thu, 01 Jan 1970 00:00:02 GMT");
  t.deepEqual(headers.ifModifiedSince(), new Date(2000));

  t.is(headers.get("If-Unmodified-Since"), "Thu, 01 Jan 1970 00:00:03 GMT");
  t.deepEqual(headers.ifUnmodifiedSince(), new Date(3000));
});

test("stringify and parse cookie values", (t) => {
  const c0 = new Cookie("n0", "v0");
  const c1 = new Cookie("n1", "v1", { path: "path0", domain: "domain0" });
  const nc0 = new SetCookie("n0", "v0");
  const nc1 = new SetCookie("n1", "v1", { path: "path0", domain: "domain0" });

  const headers = Headers.builder()
    .appendCookie(c0)
    .appendCookie(c1)
    .appendSetCookie(nc0)
    .appendSetCookie(nc1)
    .build();

  t.deepEqual(headers.allCookies(), [c0, c1]);
  t.deepEqual(headers.allSetCookies(), [nc0, nc1]);
});

import test from "ava";
import { AcceptEncoding } from "./accept-encoding.js";

test("negotiate finds matching candidates", (t) => {
  const header = new AcceptEncoding();

  t.is(header.negotiate("aa"), null);
  t.is(header.negotiate("bb"), null);

  header.add("aa");

  t.is(header.negotiate("aa"), "aa");
  t.is(header.negotiate("ab"), null);

  header.add("bb", 0.1);

  t.is(header.negotiate("aa"), "aa");
  t.is(header.negotiate("bb"), "bb");
});

test("negotiate", (t) => {
  const header = new AcceptEncoding().add("aa", 0.1).add("bb", 0.2).add("cc");

  t.is(header.negotiate("aa", "bb", "cc", "xx"), "cc");
  t.is(header.negotiate("xx", "cc", "bb", "aa"), "cc");
  t.is(header.negotiate("aa", "bb", "xx"), "bb");
  t.is(header.negotiate("xx", "bb", "aa"), "bb");
  t.is(header.negotiate("aa", "xx"), "aa");
  t.is(header.negotiate("xx", "aa"), "aa");
  t.is(header.negotiate("bb", "xx"), "bb");
  t.is(header.negotiate("xx", "bb"), "bb");
  t.is(header.negotiate("cc", "xx"), "cc");
  t.is(header.negotiate("xx", "cc"), "cc");
  t.is(header.negotiate("aa"), "aa");
  t.is(header.negotiate("bb"), "bb");
  t.is(header.negotiate("cc"), "cc");
  t.is(header.negotiate("xx"), null);
  t.is(header.negotiate("xx", "yy"), null);
});

test("negotiate is case-insensitive", (t) => {
  const header = new AcceptEncoding().add("aa").add("BB");

  t.is(header.negotiate("aa"), "aa");
  t.is(header.negotiate("AA"), "AA");
  t.is(header.negotiate("bb"), "bb");
  t.is(header.negotiate("BB"), "BB");
});

test("negotiate rejects empty candidates", (t) => {
  const header = new AcceptEncoding().add("aa").add("ab");

  t.throws(
    () => {
      header.negotiate();
    },
    { message: "Empty candidates" },
  );
});

test("stringify", (t) => {
  t.is(
    String(new AcceptEncoding().add("*", 0.8).add("aa").add("bb", 0.123456789)),
    "*; q=0.8, aa, bb; q=0.123",
  );
});

test("parse", (t) => {
  t.deepEqual(
    AcceptEncoding.parse("identity"),
    new AcceptEncoding().add("identity"),
  );
  t.deepEqual(
    AcceptEncoding.parse("identity,gzip,br"),
    new AcceptEncoding().add("identity").add("gzip").add("br"),
  );
  t.deepEqual(
    AcceptEncoding.parse("identity , gzip , br"),
    new AcceptEncoding().add("identity").add("gzip").add("br"),
  );
  t.deepEqual(
    AcceptEncoding.parse("identity;q=0.1,gzip"),
    new AcceptEncoding().add("identity", 0.1).add("gzip"),
  );
  t.deepEqual(
    AcceptEncoding.parse("identity ; q=0.1 , gzip"),
    new AcceptEncoding().add("identity", 0.1).add("gzip"),
  );
});

for (const input of [
  "xyz;",
  "xyz,",
  "xyz extra",
  "xyz; =",
  "xyz; q",
  "xyz; q=",
  "xyz; q=;",
  "xyz; q=\0,",
  "xyz; x=1",
]) {
  test(`parse error while parsing malformed input ${input}`, (t) => {
    t.throws(() => {
      AcceptEncoding.parse(input);
    });
  });
}

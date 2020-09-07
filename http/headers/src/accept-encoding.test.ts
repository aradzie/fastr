import test from "ava";
import { AcceptEncoding } from "./accept-encoding.js";
import { Entry } from "./accept.js";

test("accepts with empty list", (t) => {
  const accept = new AcceptEncoding();

  t.true(accept.accepts("identity"));
  t.false(accept.accepts("gzip"));
  t.false(accept.accepts("br"));
});

test("accepts with non empty list", (t) => {
  const accept = new AcceptEncoding().add("gzip", 0.8).add("br");

  t.true(accept.accepts("identity"));
  t.is(accept.accepts("gzip"), 0.8);
  t.true(accept.accepts("br"));
});

test("stringify", (t) => {
  t.is(
    String(new AcceptEncoding().add("*", 0.8).add("gzip").add("br", 0.9)),
    "gzip, br; q=0.9, *; q=0.8",
  );
});

test("parse simple", (t) => {
  t.deepEqual([...AcceptEncoding.parse("identity")], [new Entry("identity")]);
  t.deepEqual(
    [...AcceptEncoding.parse("identity, gzip, br")],
    [new Entry("identity"), new Entry("gzip"), new Entry("br")],
  );
});

test("parse simple with extra whitespace", (t) => {
  t.deepEqual(
    [...AcceptEncoding.parse("identity  ,  gzip  ")],
    [new Entry("identity"), new Entry("gzip")],
  );
  t.deepEqual(
    [...AcceptEncoding.parse("identity  ,  gzip    ,  ")],
    [new Entry("identity"), new Entry("gzip")],
  );
});

test("parse with parameters", (t) => {
  t.deepEqual(
    [...AcceptEncoding.parse("identity;q=0.1")],
    [new Entry("identity", 0.1)],
  );
  t.deepEqual(
    [...AcceptEncoding.parse("identity;q=0.1,gzip;q=0.9,br")],
    [new Entry("br"), new Entry("gzip", 0.9), new Entry("identity", 0.1)],
  );
});

test("parse with parameters with extra whitespace", (t) => {
  t.deepEqual(
    [...AcceptEncoding.parse("identity  ,  gzip  ;  q  =  0.9  ,  br  ")],
    [new Entry("identity"), new Entry("br"), new Entry("gzip", 0.9)],
  );
  t.deepEqual(
    [...AcceptEncoding.parse("identity  ,  gzip  ;  q  =  0.9  ,  br  , ")],
    [new Entry("identity"), new Entry("br"), new Entry("gzip", 0.9)],
  );
});

test("parse with quoted parameters", (t) => {
  t.deepEqual(
    [...AcceptEncoding.parse('gzip; q="0.5", identity; q="0.1"')],
    [new Entry("gzip", 0.5), new Entry("identity", 0.1)],
  );
});

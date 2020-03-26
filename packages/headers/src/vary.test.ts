import test from "ava";
import { Vary } from "./vary.js";

test("manipulate", (t) => {
  const header = new Vary();

  t.deepEqual([...header], []);
  t.false(header.has("*"));
  t.false(header.has("Accept"));
  t.false(header.has("Accept-Encoding"));

  header.add("Accept");

  t.deepEqual([...header], ["Accept"]);
  t.false(header.has("*"));
  t.true(header.has("Accept"));
  t.false(header.has("Accept-Encoding"));

  header.add("*");

  t.deepEqual([...header], ["Accept", "*"]);
  t.true(header.has("*"));
  t.true(header.has("Accept"));
  t.false(header.has("Accept-Encoding"));

  header.delete("Accept");

  t.deepEqual([...header], ["*"]);
  t.true(header.has("*"));
  t.false(header.has("Accept"));
  t.false(header.has("Accept-Encoding"));

  header.clear();

  t.deepEqual([...header], []);
  t.false(header.has("*"));
  t.false(header.has("Accept"));
  t.false(header.has("Accept-Encoding"));
});

test("ignore case", (t) => {
  const header = new Vary();

  header.add("accept");

  t.deepEqual([...header], ["accept"]);
  t.true(header.has("accept"));
  t.true(header.has("Accept"));
  t.true(header.has("ACCEPT"));
  t.is(String(header), "accept");

  header.add("ACCEPT");

  t.deepEqual([...header], ["ACCEPT"]);
  t.true(header.has("accept"));
  t.true(header.has("Accept"));
  t.true(header.has("ACCEPT"));
  t.is(String(header), "ACCEPT");

  header.delete("AcCePt");

  t.deepEqual([...header], []);
  t.false(header.has("accept"));
  t.false(header.has("Accept"));
  t.false(header.has("ACCEPT"));
  t.is(String(header), "");
});

test("stringify", (t) => {
  t.is(String(new Vary("*")), "*");
  t.is(String(new Vary("User-Agent")), "User-Agent");
  t.is(
    String(new Vary("Accept", "Accept-Encoding")),
    "Accept, Accept-Encoding",
  );
});

test("parse", (t) => {
  t.deepEqual(Vary.parse("*"), new Vary("*"));
  t.deepEqual(Vary.parse("Accept"), new Vary("Accept"));
  t.deepEqual(
    Vary.parse("Accept,Accept-Encoding"),
    new Vary("Accept", "Accept-Encoding"),
  );
  t.deepEqual(
    Vary.parse("Accept , Accept-Encoding"),
    new Vary("Accept", "Accept-Encoding"),
  );

  t.throws(() => {
    Vary.parse("Accept,");
  });
  t.throws(() => {
    Vary.parse(",Accept");
  });
  t.throws(() => {
    Vary.parse("=");
  });
});

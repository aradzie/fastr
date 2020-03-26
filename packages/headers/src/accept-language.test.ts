import test from "ava";
import { AcceptLanguage } from "./accept-language.js";

test("negotiate when header is empty", (t) => {
  const header = new AcceptLanguage();

  t.deepEqual(header.negotiateAll("a", "b", "c"), ["a", "b", "c"]);
  t.deepEqual(header.negotiateAll("c", "b", "a"), ["c", "b", "a"]);
});

test("negotiate when header is a wildcard", (t) => {
  const header = new AcceptLanguage();

  header.add("*");

  t.deepEqual(header.negotiateAll("a", "b", "c"), ["a", "b", "c"]);
  t.deepEqual(header.negotiateAll("c", "b", "a"), ["c", "b", "a"]);
});

test("negotiate when header is a wildcard; q=0", (t) => {
  const header = new AcceptLanguage();

  header.add("*", 0);

  t.deepEqual(header.negotiateAll("a", "b", "c"), []);
  t.deepEqual(header.negotiateAll("c", "b", "a"), []);

  header.add("a");
  header.add("b");

  t.deepEqual(header.negotiateAll("a", "b", "c"), ["a", "b"]);
  t.deepEqual(header.negotiateAll("c", "b", "a"), ["a", "b"]);
});

test("negotiate finds the most specific candidates", (t) => {
  const header = new AcceptLanguage();

  header.add("a", 0.1).add("b", 0.1).add("u", 0.2).add("v", 0.2).add("z", 0.0);

  t.deepEqual(
    header.negotiateAll("a", "b", "u", "v", "x", "y", "z"), //
    ["u", "v", "a", "b"],
  );
  t.deepEqual(
    header.negotiateAll("z", "y", "x", "v", "u", "b", "a"), //
    ["u", "v", "a", "b"],
  );

  header.add("*", 0.9);

  t.deepEqual(
    header.negotiateAll("a", "b", "u", "v", "x", "y", "z"), //
    ["u", "v", "a", "b", "x", "y"],
  );
  t.deepEqual(
    header.negotiateAll("z", "y", "x", "v", "u", "b", "a"), //
    ["u", "v", "a", "b", "y", "x"],
  );
});

test("negotiate is case-insensitive", (t) => {
  const header = new AcceptLanguage();

  header.add("a");
  header.add("B");

  t.deepEqual(header.negotiateAll("A", "b"), ["A", "b"]);
  t.deepEqual(header.negotiateAll("a", "B"), ["a", "B"]);
});

test("negotiate rejects empty candidates", (t) => {
  const header = new AcceptLanguage();

  t.throws(
    () => {
      header.negotiateAll();
    },
    { message: "Empty candidates" },
  );
});

test("stringify", (t) => {
  t.is(
    String(new AcceptLanguage().add("*", 0.8).add("a").add("b", 0.123456789)),
    "*; q=0.8, a, b; q=0.123",
  );
});

test("parse", (t) => {
  t.deepEqual(
    AcceptLanguage.parse("de,en-US,en"),
    new AcceptLanguage().add("de").add("en-US").add("en"),
  );
  t.deepEqual(
    AcceptLanguage.parse("de , en-US , en"),
    new AcceptLanguage().add("de").add("en-US").add("en"),
  );
  t.deepEqual(
    AcceptLanguage.parse("de;q=0.1,en-US,en"),
    new AcceptLanguage().add("de", 0.1).add("en-US").add("en"),
  );
  t.deepEqual(
    AcceptLanguage.parse("de ; q=0.1 , en-US , en"),
    new AcceptLanguage().add("de", 0.1).add("en-US").add("en"),
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
      AcceptLanguage.parse(input);
    });
  });
}

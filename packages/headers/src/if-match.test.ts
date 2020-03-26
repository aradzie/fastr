import test from "ava";
import { IfMatch } from "./if-match.js";

test("matches any etags", (t) => {
  const header = new IfMatch(true);

  t.true(header.matches("haha", /* strong= */ false));
  t.true(header.matches("haha", /* strong= */ true));
  t.true(header.matches("hoho", /* strong= */ false));
  t.true(header.matches("hoho", /* strong= */ true));
});

test("matches specific etags", (t) => {
  const header = new IfMatch(false, ['W/"foo"', 'W/"bar"', '"baz"']);

  t.true(header.matches('"foo"', /* strong= */ false));
  t.false(header.matches('"foo"', /* strong= */ true));
  t.true(header.matches('W/"foo"', /* strong= */ false));
  t.false(header.matches('W/"foo"', /* strong= */ true));

  t.true(header.matches('"baz"', /* strong= */ false));
  t.true(header.matches('"baz"', /* strong= */ true));
  t.true(header.matches('W/"baz"', /* strong= */ false));
  t.false(header.matches('W/"baz"', /* strong= */ true));

  t.false(header.matches('"haha"', /* strong= */ false));
  t.false(header.matches('"haha"', /* strong= */ true));
  t.false(header.matches('W/"haha"', /* strong= */ false));
  t.false(header.matches('W/"haha"', /* strong= */ true));
});

test("stringify", (t) => {
  t.is(String(new IfMatch(true, ['W/"foo"', 'W/"bar"', '"baz"'])), "*");
  t.is(
    String(new IfMatch(false, ['W/"foo"', 'W/"bar"', '"baz"'])),
    'W/"foo", W/"bar", "baz"',
  );
});

test("parse", (t) => {
  t.deepEqual(
    IfMatch.parse("*"), //
    new IfMatch(true),
  );
  t.deepEqual(
    IfMatch.parse('""'), //
    new IfMatch(false, ['""']),
  );
  t.deepEqual(
    IfMatch.parse('W/""'), //
    new IfMatch(false, ['W/""']),
  );
  t.deepEqual(
    IfMatch.parse('"foo"'), //
    new IfMatch(false, ['"foo"']),
  );
  t.deepEqual(
    IfMatch.parse('W/"bar"'), //
    new IfMatch(false, ['W/"bar"']),
  );
  t.deepEqual(
    IfMatch.parse('W/"","foo" , W/"bar"'), //
    new IfMatch(false, ['W/""', '"foo"', 'W/"bar"']),
  );
});

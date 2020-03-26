import test from "ava";
import { IfNoneMatch } from "./if-none-match.js";

test("matches any etags", (t) => {
  const header = new IfNoneMatch(true);

  t.true(header.matches("haha", /* strong= */ false));
  t.true(header.matches("haha", /* strong= */ true));
  t.true(header.matches("hoho", /* strong= */ false));
  t.true(header.matches("hoho", /* strong= */ true));
});

test("matches specific etags", (t) => {
  const header = new IfNoneMatch(false, ['W/"foo"', 'W/"bar"', '"baz"']);

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
  t.is(String(new IfNoneMatch(true, ['W/"foo"', 'W/"bar"', '"baz"'])), "*");
  t.is(
    String(new IfNoneMatch(false, ['W/"foo"', 'W/"bar"', '"baz"'])),
    'W/"foo", W/"bar", "baz"',
  );
});

test("parse", (t) => {
  t.deepEqual(
    IfNoneMatch.parse("*"), //
    new IfNoneMatch(true),
  );
  t.deepEqual(
    IfNoneMatch.parse('""'), //
    new IfNoneMatch(false, ['""']),
  );
  t.deepEqual(
    IfNoneMatch.parse('W/""'), //
    new IfNoneMatch(false, ['W/""']),
  );
  t.deepEqual(
    IfNoneMatch.parse('"foo"'), //
    new IfNoneMatch(false, ['"foo"']),
  );
  t.deepEqual(
    IfNoneMatch.parse('W/"bar"'), //
    new IfNoneMatch(false, ['W/"bar"']),
  );
  t.deepEqual(
    IfNoneMatch.parse('W/"","foo" , W/"bar"'), //
    new IfNoneMatch(false, ['W/""', '"foo"', 'W/"bar"']),
  );
});

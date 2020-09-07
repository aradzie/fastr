import test from "ava";
import {
  escapeToken,
  isToken,
  isValidCookieValue,
  isValidHeaderValue,
  Scanner,
} from "./syntax.js";

test("isToken", (t) => {
  t.false(isToken(""));
  t.false(isToken("\0"));
  t.false(isToken("\r"));
  t.false(isToken("\n"));
  t.false(isToken("\t"));
  t.false(isToken(" "));
  t.false(isToken(":"));
  t.false(isToken(";"));
  t.false(isToken(","));
  t.false(isToken("="));
  t.false(isToken('"'));
  t.false(isToken("\u007f"));
  t.false(isToken("\u00ff"));
  t.true(isToken("*~_token-TOKEN-123_~*"));
});

test("escapeToken", (t) => {
  t.is(escapeToken("*~_token-TOKEN-123_~*"), "*~_token-TOKEN-123_~*");
  t.is(escapeToken('" abc "'), '"\\" abc \\""');
});

test("isValidaHeaderName", (t) => {
  t.false(isValidHeaderValue("\0"));
  t.false(isValidHeaderValue("\r"));
  t.false(isValidHeaderValue("\n"));
  t.true(isValidHeaderValue('"abc"'));
});

test("isValidCookieValue", (t) => {
  t.false(isValidCookieValue("\0"));
  t.false(isValidCookieValue("\r"));
  t.false(isValidCookieValue("\n"));
  t.false(isValidCookieValue("\\"));
  t.false(isValidCookieValue(","));
  t.false(isValidCookieValue(";"));
  t.false(isValidCookieValue('"'));
  t.true(isValidCookieValue(""));
  t.true(isValidCookieValue('""'));
  t.true(isValidCookieValue("abc"));
  t.true(isValidCookieValue('"abc"'));
});

test("read token", (t) => {
  t.is(new Scanner(``).readToken(), null);
  t.is(new Scanner(`=`).readToken(), null);
  t.is(new Scanner(`,`).readToken(), null);
  t.is(new Scanner(`;`).readToken(), null);
  t.is(new Scanner(`ABCabc123`).readToken(), "ABCabc123");
  t.is(new Scanner(` \tABCabc123\t `).readToken(), "ABCabc123");
});

test("read quoted string", (t) => {
  // Not a quoted string.
  t.is(new Scanner(``).readQuotedString(), null);
  t.is(new Scanner(`abc`).readQuotedString(), null);

  // A quoted string.
  t.is(new Scanner(`""`).readQuotedString(), ``);
  t.is(new Scanner(`",;="`).readQuotedString(), `,;=`);
  t.is(new Scanner(`" abc "`).readQuotedString(), ` abc `);
  t.is(new Scanner(`"\\"abc\\""`).readQuotedString(), `"abc"`);
  t.is(new Scanner(`"\\"abc\\""`).readQuotedString(), `"abc"`);

  // Not properly terminated.
  t.is(new Scanner(`"`).readQuotedString(), ``);
  t.is(new Scanner(`"\\`).readQuotedString(), `\\`);
  t.is(new Scanner(`"\\"`).readQuotedString(), `"`);
});

test("read params", (t) => {
  t.is(new Scanner(``).readParams(), null);
  t.is(new Scanner(` `).readParams(), null);
  t.deepEqual(new Scanner(`;`).readParams(), []);
  t.deepEqual(new Scanner(` ; `).readParams(), []);
  t.deepEqual(new Scanner(` ; a=1`).readParams(), [["a", "1"]]);
  t.deepEqual(new Scanner(` ; a=" ,;= `).readParams(), [["a", " ,;= "]]);
  t.deepEqual(new Scanner(` ; a=" ,;= " `).readParams(), [["a", " ,;= "]]);
  t.deepEqual(new Scanner(`;a=1, `).readParams(), [["a", "1"]]);
  t.deepEqual(new Scanner(`;a=1; `).readParams(), [["a", "1"]]);
  t.deepEqual(new Scanner(`;a=1; b=2;c = 3`).readParams(), [
    ["a", "1"],
    ["b", "2"],
    ["c", "3"],
  ]);
});

test("read until and do not trim whitespace", (t) => {
  t.is(new Scanner("").readUntil(0x3b /* ; */, false), "");
  t.is(new Scanner(";").readUntil(0x3b /* ; */, false), "");
  t.is(new Scanner(" abc ").readUntil(0x3b /* ; */, false), " abc ");
  const scanner = new Scanner(" abc ;");
  t.is(scanner.readUntil(0x3b /* ; */, false), " abc ");
  t.true(scanner.readSeparator(0x3b /* ; */));
});

test("read until and trim whitespace", (t) => {
  t.is(new Scanner("").readUntil(0x3b /* ; */, true), "");
  t.is(new Scanner(";").readUntil(0x3b /* ; */, true), "");
  t.is(new Scanner(" abc ").readUntil(0x3b /* ; */, true), "abc");
  const scanner = new Scanner(" abc ;");
  t.is(scanner.readUntil(0x3b /* ; */, true), "abc");
  t.true(scanner.readSeparator(0x3b /* ; */));
});

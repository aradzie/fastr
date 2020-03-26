import test from "ava";
import {
  escapeToken,
  isToken,
  isValidHeaderValue,
  Scanner,
  Separator,
} from "./syntax.js";

test("is valida header name", (t) => {
  t.false(isValidHeaderValue("\0"));
  t.false(isValidHeaderValue("\r"));
  t.false(isValidHeaderValue("\n"));
  t.false(isValidHeaderValue("\x7f"));
  t.false(isValidHeaderValue("\u0100"));
  t.true(isValidHeaderValue('"\x09\x20-abc-123-\xff"'));
});

test("is token", (t) => {
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

test("escape token", (t) => {
  t.is(escapeToken("*~_token-TOKEN-123_~*"), "*~_token-TOKEN-123_~*");
  t.is(escapeToken('" abc "'), '"\\" abc \\""');
});

test("read token", (t) => {
  t.is(new Scanner(``).readToken(), null);
  t.is(new Scanner(`=`).readToken(), null);
  t.is(new Scanner(`,`).readToken(), null);
  t.is(new Scanner(`;`).readToken(), null);
  t.is(new Scanner(`"`).readToken(), null);
  t.is(new Scanner(` `).readToken(), null);
  t.is(new Scanner(`a`).readToken(), "a");
  t.is(new Scanner(`A`).readToken(), "A");
  t.is(new Scanner(`ABCabc123`).readToken(), "ABCabc123");
});

test("read quoted string", (t) => {
  // Not a quoted string.
  t.is(new Scanner(``).readQuotedString(), null);
  t.is(new Scanner(`abc`).readQuotedString(), null);

  // A quoted string.
  t.is(new Scanner(`""`).readQuotedString(), ``);
  t.is(new Scanner(`" "`).readQuotedString(), ` `);
  t.is(new Scanner(`",;="`).readQuotedString(), `,;=`);
  t.is(new Scanner(`" abc "`).readQuotedString(), ` abc `);
  t.is(new Scanner(`"\\"abc\\""`).readQuotedString(), `"abc"`);
  t.is(new Scanner(`"\\"abc\\""`).readQuotedString(), `"abc"`);

  // Not properly terminated.
  t.is(new Scanner(`"`).readQuotedString(), ``);
  t.is(new Scanner(`"\\`).readQuotedString(), `\\`);
  t.is(new Scanner(`"\\"`).readQuotedString(), `"`);
});

test("read integer", (t) => {
  t.is(new Scanner("").readInteger(), null);
  t.is(new Scanner(" ").readInteger(), null);
  t.is(new Scanner(".").readInteger(), null);
  t.is(new Scanner(".1").readInteger(), null);
  t.is(new Scanner("0").readInteger(), 0);
  t.is(new Scanner("9").readInteger(), 9);
  t.is(new Scanner("123").readInteger(), 123);
  t.is(new Scanner("123.456").readInteger(), 123);
  t.is(new Scanner("0x").readNumber(), 0);
  t.is(new Scanner("1x").readNumber(), 1);
});

test("read number", (t) => {
  t.is(new Scanner("").readNumber(), null);
  t.is(new Scanner("").readNumber(), null);
  t.is(new Scanner(" ").readNumber(), null);
  t.is(new Scanner(".").readNumber(), null);
  t.is(new Scanner("1.").readNumber(), null);
  t.is(new Scanner(".1").readNumber(), null);
  t.is(new Scanner("0").readNumber(), 0);
  t.is(new Scanner("0.0").readNumber(), 0);
  t.is(new Scanner("1.0").readNumber(), 1.0);
  t.is(new Scanner("0.1").readNumber(), 0.1);
  t.is(new Scanner("9.0").readNumber(), 9.0);
  t.is(new Scanner("0.9").readNumber(), 0.9);
  t.is(new Scanner("123").readNumber(), 123);
  t.is(new Scanner("123.456").readNumber(), 123.456);
  t.is(new Scanner("0x").readNumber(), 0);
  t.is(new Scanner("1x").readNumber(), 1);
  t.is(new Scanner("0.1x").readNumber(), 0.1);
});

test("read until", (t) => {
  t.is(new Scanner("").readUntil(Separator.Semicolon), "");
  t.is(new Scanner(";").readUntil(Separator.Semicolon), "");
  t.is(new Scanner(" abc ").readUntil(Separator.Semicolon), " abc ");
  const scanner = new Scanner(" abc ;");
  t.is(scanner.readUntil(Separator.Semicolon), " abc ");
  t.true(scanner.readChar(Separator.Semicolon));
});

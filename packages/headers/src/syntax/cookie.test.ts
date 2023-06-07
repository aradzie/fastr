import test from "ava";
import { isValidCookieValue, readCookieNameValue } from "./cookie.js";
import { Scanner } from "./syntax.js";

test("validate cookie value", (t) => {
  t.false(isValidCookieValue("\0"));
  t.false(isValidCookieValue("\r"));
  t.false(isValidCookieValue("\n"));
  t.false(isValidCookieValue("\x7f"));
  t.false(isValidCookieValue("\xff"));
  t.false(isValidCookieValue("\u0100"));
  t.false(isValidCookieValue("\\"));
  t.false(isValidCookieValue(","));
  t.false(isValidCookieValue(";"));
  t.false(isValidCookieValue('"'));
  t.true(isValidCookieValue(""));
  t.true(isValidCookieValue('""'));
  t.true(isValidCookieValue("abc"));
  t.true(isValidCookieValue('"abc"'));
});

test("read cookie", (t) => {
  t.is(readCookieNameValue(new Scanner("")), null);
  t.is(readCookieNameValue(new Scanner(" ")), null);
  t.is(readCookieNameValue(new Scanner("; x")), null);
  t.is(readCookieNameValue(new Scanner(" ; x")), null);
  t.is(readCookieNameValue(new Scanner("=")), null);
  t.is(readCookieNameValue(new Scanner("= ")), null);
  t.is(readCookieNameValue(new Scanner("=; x")), null);
  t.is(readCookieNameValue(new Scanner("= ; x")), null);
  t.deepEqual(readCookieNameValue(new Scanner("a=")), ["a", ""]);
  t.deepEqual(readCookieNameValue(new Scanner("a=; x")), ["a", ""]);
  t.deepEqual(readCookieNameValue(new Scanner("a=1")), ["a", "1"]);
  t.deepEqual(readCookieNameValue(new Scanner("a=1; x")), ["a", "1"]);
  t.deepEqual(readCookieNameValue(new Scanner("a==")), ["a", "="]);
  t.deepEqual(readCookieNameValue(new Scanner("a==; x")), ["a", "="]);
  t.deepEqual(readCookieNameValue(new Scanner(" a = 1 ")), [" a ", " 1 "]);
  t.deepEqual(readCookieNameValue(new Scanner(" a = 1 ; x")), [" a ", " 1 "]);
  t.deepEqual(readCookieNameValue(new Scanner(" a = = ")), [" a ", " = "]);
  t.deepEqual(readCookieNameValue(new Scanner(" a = = ; x")), [" a ", " = "]);
});

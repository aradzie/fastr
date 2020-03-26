import test from "ava";
import { isValidCookieValue } from "./syntax-cookie.js";

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

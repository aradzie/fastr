import test from "ava";
import { readUriReference } from "./syntax-uri-reference.js";
import { Scanner } from "./syntax.js";

test("read URI-Reference", (t) => {
  t.is(readUriReference(new Scanner(`<http://host/>`)), "http://host/");
});

test("syntax error", (t) => {
  t.is(readUriReference(new Scanner(``)), null);
  t.is(readUriReference(new Scanner(`<`)), null);
  t.is(readUriReference(new Scanner(`<>`)), null);
});

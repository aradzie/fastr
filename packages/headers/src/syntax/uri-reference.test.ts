import test from "ava";
import { Scanner } from "./syntax.js";
import { readUriReference } from "./uri-reference.js";

test("read URI-Reference", (t) => {
  t.is(readUriReference(new Scanner(`<http://host/>`)), "http://host/");
});

test("syntax error", (t) => {
  t.is(readUriReference(new Scanner(``)), null);
  t.is(readUriReference(new Scanner(`<`)), null);
  t.is(readUriReference(new Scanner(`<>`)), null);
});

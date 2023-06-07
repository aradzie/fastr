import test from "ava";
import { readETag } from "./etag.js";
import { Scanner } from "./syntax.js";

test("read ETag", (t) => {
  const scanner = new Scanner(`"" W/"" "Abc-012+!" W/"Abc-012+!" "\u00ff"`);
  t.is(readETag(scanner), `""`);
  scanner.skipWs();
  t.is(readETag(scanner), `W/""`);
  scanner.skipWs();
  t.is(readETag(scanner), `"Abc-012+!"`);
  scanner.skipWs();
  t.is(readETag(scanner), `W/"Abc-012+!"`);
  scanner.skipWs();
  t.is(readETag(scanner), `"\u00ff"`);
});

test("syntax error", (t) => {
  t.is(readETag(new Scanner(``)), null);
  t.is(readETag(new Scanner(` `)), null);
  t.is(readETag(new Scanner(`\u0000`)), null);

  t.is(readETag(new Scanner(`,`)), null);
  t.is(readETag(new Scanner(`;`)), null);
  t.is(readETag(new Scanner(`Abc`)), null);

  t.is(readETag(new Scanner(`"`)), null);
  t.is(readETag(new Scanner(`" `)), null);
  t.is(readETag(new Scanner(`"Abc`)), null);
  t.is(readETag(new Scanner(`"Abc `)), null);
  t.is(readETag(new Scanner(`"Abc "`)), null);

  t.is(readETag(new Scanner(`W`)), null);
  t.is(readETag(new Scanner(`W `)), null);
  t.is(readETag(new Scanner(`W/`)), null);
  t.is(readETag(new Scanner(`W/ `)), null);
  t.is(readETag(new Scanner(`W/"`)), null);
  t.is(readETag(new Scanner(`W/" `)), null);
  t.is(readETag(new Scanner(`W/"Abc`)), null);
  t.is(readETag(new Scanner(`W/"Abc `)), null);
  t.is(readETag(new Scanner(`W/"Abc "`)), null);
});

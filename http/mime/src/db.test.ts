import { MediaType } from "@webfx-http/headers";
import test from "ava";
import { MimeDb } from "./db";

test("classify mime type", (t) => {
  t.true(MimeDb.isJson(MediaType.parse("application/json")));
  t.true(MimeDb.isText(MediaType.parse("text/plain")));
  t.true(MimeDb.isBinary(MediaType.parse("application/octet-stream")));
});

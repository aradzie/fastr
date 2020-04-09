import test from "ava";
import { guessContentType } from "./type";

test("use custom type", (t) => {
  t.is(guessContentType("text", "foo/bar")[1], "foo/bar");
});

test("guess text type", (t) => {
  t.is(guessContentType("text", null)[1], "text/plain");
});

test("guess binary type", (t) => {
  t.is(
    guessContentType(new ArrayBuffer(0), null)[1],
    "application/octet-stream",
  );
  t.is(
    guessContentType(new Uint8Array(0), null)[1],
    "application/octet-stream",
  );
});

test("guess form type", (t) => {
  t.is(
    guessContentType(new URLSearchParams(), null)[1],
    "application/x-www-form-urlencoded",
  );
});

test("guess json type", (t) => {
  t.is(guessContentType(new Map(), null)[1], "application/json"); // OMG
  t.is(guessContentType({}, null)[1], "application/json");
  t.is(guessContentType([], null)[1], "application/json");
});

import test from "ava";
import { Link } from "./link";

test("parse", (t) => {
  t.deepEqual(Link.parse("<http://localhost/>"), new Link("http://localhost/"));
});

test("toString", (t) => {
  t.is(String(new Link("http://localhost/")), "<http://localhost/>");
});

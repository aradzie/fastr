import test from "ava";
import { Link, LinkEntry } from "./link.js";

test("stringify", (t) => {
  t.is(
    String(new Link(new LinkEntry("http://foo/a.txt"))),
    "<http://foo/a.txt>",
  );
  t.is(
    String(
      new Link(
        new LinkEntry("http://foo/a.txt"),
        new LinkEntry("http://bar/b.txt"),
      ),
    ),
    "<http://foo/a.txt>, <http://bar/b.txt>",
  );
  t.is(
    String(
      new Link(
        new LinkEntry("http://foo/a.txt", [
          ["rel", "preload"],
          ["as", "font"],
        ]),
        new LinkEntry("http://bar/b.txt"),
      ),
    ),
    "<http://foo/a.txt>; rel=preload; as=font, <http://bar/b.txt>",
  );
});

test("parse", (t) => {
  t.deepEqual(
    Link.parse("<http://foo/a.txt>"),
    new Link(new LinkEntry("http://foo/a.txt")),
  );
  t.deepEqual(
    Link.parse("<http://foo/a.txt>, <http://bar/b.txt>"),
    new Link(
      new LinkEntry("http://foo/a.txt"),
      new LinkEntry("http://bar/b.txt"),
    ),
  );
  t.deepEqual(
    Link.parse(
      '<http://foo/a.txt>; rel=preload; as="font", <http://bar/b.txt>',
    ),
    new Link(
      new LinkEntry("http://foo/a.txt", [
        ["rel", "preload"],
        ["as", "font"],
      ]),
      new LinkEntry("http://bar/b.txt"),
    ),
  );
});

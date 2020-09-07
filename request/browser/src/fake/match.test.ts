import test from "ava";
import { match } from "./match.js";

test("match method exact", (t) => {
  const matcher = match("GET", "/");

  t.true(matcher({ method: "get", url: "/" }));
  t.true(matcher({ method: "GET", url: "/" }));
  t.false(matcher({ method: "POST", url: "/" }));
});

test("match method wildcard", (t) => {
  const matcher = match("*", "/");

  t.true(matcher({ method: "GET", url: "/" }));
  t.true(matcher({ method: "POST", url: "/" }));
  t.false(matcher({ method: "GET", url: "/x" }));
  t.false(matcher({ method: "POST", url: "/x" }));
});

test("match string url exact", (t) => {
  const matcher = match("GET", "/url1");

  t.true(matcher({ method: "GET", url: "/url1" }));
  t.false(matcher({ method: "GET", url: "/url10" }));
  t.false(matcher({ method: "GET", url: "/url2" }));
});

test("match string url wildcard", (t) => {
  const matcher = match("GET", "*");

  t.true(matcher({ method: "GET", url: "/url1" }));
  t.true(matcher({ method: "GET", url: "/url2" }));
  t.false(matcher({ method: "POST", url: "/url2" }));
});

test("match regex url exact", (t) => {
  const matcher = match("GET", /^\/url1.*/);

  t.true(matcher({ method: "GET", url: "/url1" }));
  t.true(matcher({ method: "GET", url: "/url10" }));
  t.false(matcher({ method: "GET", url: "/url2" }));
});

import test from "ava";
import type { HttpRequest } from "../types";
import { match } from "./match";

test("match method exact", (t) => {
  const matcher = match("GET", "/");

  t.true(matcher({ method: "get", url: "/" } as HttpRequest));
  t.true(matcher({ method: "GET", url: "/" } as HttpRequest));
  t.false(matcher({ method: "POST", url: "/" } as HttpRequest));
});

test("match method wildcard", (t) => {
  const matcher = match("*", "/");

  t.true(matcher({ method: "GET", url: "/" } as HttpRequest));
  t.true(matcher({ method: "POST", url: "/" } as HttpRequest));
  t.false(matcher({ method: "GET", url: "/x" } as HttpRequest));
  t.false(matcher({ method: "POST", url: "/x" } as HttpRequest));
});

test("match string url exact", (t) => {
  const matcher = match("GET", "/url1");

  t.true(matcher({ method: "GET", url: "/url1" } as HttpRequest));
  t.false(matcher({ method: "GET", url: "/url10" } as HttpRequest));
  t.false(matcher({ method: "GET", url: "/url2" } as HttpRequest));
});

test("match string url wildcard", (t) => {
  const matcher = match("GET", "*");

  t.true(matcher({ method: "GET", url: "/url1" } as HttpRequest));
  t.true(matcher({ method: "GET", url: "/url2" } as HttpRequest));
  t.false(matcher({ method: "POST", url: "/url2" } as HttpRequest));
});

test("match regex url exact", (t) => {
  const matcher = match("GET", /^\/url1.*/);

  t.true(matcher({ method: "GET", url: "/url1" } as HttpRequest));
  t.true(matcher({ method: "GET", url: "/url10" } as HttpRequest));
  t.false(matcher({ method: "GET", url: "/url2" } as HttpRequest));
});

import test from "ava";
import { kMethodNotAllowed, kNotFound, Node } from "./node.js";
import { Route } from "./route.js";

test("insert literal segments", (t) => {
  const route1 = new Route({
    name: "route1",
    path: "/",
    method: "GET",
    middleware: [],
  });
  const route2 = new Route({
    name: "route2",
    path: "/",
    method: "PUT",
    middleware: [],
  });
  const route3 = new Route({
    name: "route3",
    path: "/a/b/c",
    method: "GET",
    middleware: [],
  });
  const route4 = new Route({
    name: "route4",
    path: "/a/b/c",
    method: "PUT",
    middleware: [],
  });
  const root = new Node();

  Node.insert(root, route1);
  Node.insert(root, route2);
  Node.insert(root, route3);
  Node.insert(root, route4);

  t.deepEqual(Node.find(root, "/", "GET", {}), {
    path: "/",
    method: "GET",
    route: route1,
    params: {},
  });
  t.deepEqual(Node.find(root, "/", "PUT", {}), {
    path: "/",
    method: "PUT",
    route: route2,
    params: {},
  });
  t.deepEqual(Node.find(root, "/a/b/c", "GET", {}), {
    path: "/a/b/c",
    method: "GET",
    route: route3,
    params: {},
  });
  t.deepEqual(Node.find(root, "/a/b/c", "PUT", {}), {
    path: "/a/b/c",
    method: "PUT",
    route: route4,
    params: {},
  });

  t.is(Node.find(root, "/", "DELETE", {}), kMethodNotAllowed);
  t.is(Node.find(root, "/a", "GET", {}), kNotFound);
  t.is(Node.find(root, "/a/b", "GET", {}), kNotFound);
  t.is(Node.find(root, "/a/b/c/d", "GET", {}), kNotFound);
  t.is(Node.find(root, "/x/y/z", "GET", {}), kNotFound);
});

test("insert param segments", (t) => {
  const route1 = new Route({
    name: "route1",
    path: "/{param}",
    method: "GET",
    middleware: [],
  });
  const route2 = new Route({
    name: "route2",
    path: "/prefix/{p1:[a-z]+}/{p2:[a-z]+}-{p3:[a-z]+}/suffix",
    method: "GET",
    middleware: [],
  });
  const root = new Node();

  Node.insert(root, route1);
  Node.insert(root, route2);

  t.deepEqual(Node.find(root, "/something", "GET", {}), {
    path: "/something",
    method: "GET",
    route: route1,
    params: {
      param: "something",
    },
  });
  t.deepEqual(Node.find(root, "/prefix/a/b-c/suffix", "GET", {}), {
    path: "/prefix/a/b-c/suffix",
    method: "GET",
    route: route2,
    params: {
      p1: "a",
      p2: "b",
      p3: "c",
    },
  });

  t.is(
    Node.find(root, "/prefix/a/b-c/suffix", "DELETE", {}),
    kMethodNotAllowed,
  );
  t.is(Node.find(root, "/prefix/A/B-C/suffix", "GET", {}), kNotFound);
  t.is(Node.find(root, "/prefix/suffix", "GET", {}), kNotFound);
  t.is(Node.find(root, "/prefix/a/suffix", "GET", {}), kNotFound);
  t.is(Node.find(root, "/prefix/a/suffix/b-c", "GET", {}), kNotFound);
});

test("literal segments take precedence", (t) => {
  const route1 = new Route({
    name: "route1",
    path: "/prefix",
    method: "*",
    middleware: [],
  });
  const route2 = new Route({
    name: "route2",
    path: "/{param1}",
    method: "*",
    middleware: [],
  });
  const route3 = new Route({
    name: "route3",
    path: "/prefix/suffix",
    method: "*",
    middleware: [],
  });
  const route4 = new Route({
    name: "route4",
    path: "/{param1}/{param2}",
    method: "*",
    middleware: [],
  });
  const route5 = new Route({
    name: "route5",
    path: "/prefix/{param2}",
    method: "*",
    middleware: [],
  });
  const route6 = new Route({
    name: "route6",
    path: "/{param1}/suffix",
    method: "*",
    middleware: [],
  });
  const root = new Node();

  Node.insert(root, route1);
  Node.insert(root, route2);
  Node.insert(root, route3);
  Node.insert(root, route4);
  Node.insert(root, route5);
  Node.insert(root, route6);

  t.deepEqual(Node.find(root, "/prefix", "GET", {}), {
    path: "/prefix",
    method: "GET",
    route: route1,
    params: {},
  });
  t.deepEqual(Node.find(root, "/value1", "GET", {}), {
    path: "/value1",
    method: "GET",
    route: route2,
    params: { param1: "value1" },
  });
  t.deepEqual(Node.find(root, "/prefix/suffix", "GET", {}), {
    path: "/prefix/suffix",
    method: "GET",
    route: route3,
    params: {},
  });
  t.deepEqual(Node.find(root, "/value1/value2", "GET", {}), {
    path: "/value1/value2",
    method: "GET",
    route: route4,
    params: { param1: "value1", param2: "value2" },
  });
  t.deepEqual(Node.find(root, "/prefix/value2", "GET", {}), {
    path: "/prefix/value2",
    method: "GET",
    route: route5,
    params: { param2: "value2" },
  });
  t.deepEqual(Node.find(root, "/value1/suffix", "GET", {}), {
    path: "/value1/suffix",
    method: "GET",
    route: route6,
    params: { param1: "value1" },
  });
});

test("specific methods take precedence", (t) => {
  const route1 = new Route({
    name: "route1",
    path: "/",
    method: "GET",
    middleware: [],
  });
  const route2 = new Route({
    name: "route2",
    path: "/",
    method: "PUT",
    middleware: [],
  });
  const route3 = new Route({
    name: "route3",
    path: "/",
    method: "*",
    middleware: [],
  });
  const root = new Node();

  Node.insert(root, route1);
  Node.insert(root, route2);
  Node.insert(root, route3);

  t.deepEqual(Node.find(root, "/", "GET", {}), {
    path: "/",
    method: "GET",
    route: route1,
    params: {},
  });
  t.deepEqual(Node.find(root, "/", "PUT", {}), {
    path: "/",
    method: "PUT",
    route: route2,
    params: {},
  });
  t.deepEqual(Node.find(root, "/", "POST", {}), {
    path: "/",
    method: "POST",
    route: route3,
    params: {},
  });
  t.deepEqual(Node.find(root, "/", "PATCH", {}), {
    path: "/",
    method: "PATCH",
    route: route3,
    params: {},
  });
});

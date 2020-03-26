import test from "ava";
import { Json } from "./json";

test("json", (t) => {
  const json = new Json({ data: "json" });
  t.is(String(json), "[object Json]");
  t.deepEqual(json.data, { data: "json" });
  t.is(json.stringify(), '{"data":"json"}');
});

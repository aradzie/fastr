import test from "ava";
import { ExtFields } from "./extfields.js";

test("manipulate ext fields", (t) => {
  const ext = new ExtFields();

  t.deepEqual([...ext], []);
  t.deepEqual([...ext.keys()], []);
  t.is(String(ext), "");

  ext.set("F1", null);
  ext.set("F2", "V2");

  t.deepEqual(
    [...ext],
    [
      ["f1", null],
      ["f2", "V2"],
    ],
  );
  t.deepEqual([...ext.keys()], ["f1", "f2"]);
  t.is(String(ext), "f1, f2=V2");

  ext.set("f1", "v/1");

  t.deepEqual(
    [...ext],
    [
      ["f1", "v/1"],
      ["f2", "V2"],
    ],
  );
  t.deepEqual([...ext.keys()], ["f1", "f2"]);
  t.is(String(ext), 'f1="v/1", f2=V2');

  ext.delete("F1");

  t.deepEqual([...ext], [["f2", "V2"]]);
  t.deepEqual([...ext.keys()], ["f2"]);
  t.is(String(ext), "f2=V2");
});

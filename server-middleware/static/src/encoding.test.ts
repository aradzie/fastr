import test from "ava";
import { Encoding } from "./encoding";

test("detect encoding", (t) => {
  t.deepEqual(Encoding.forPath("file.txt"), {
    basePath: "file.txt",
    encoding: Encoding.identity,
  });
  t.deepEqual(Encoding.forPath("file.txt.gz"), {
    basePath: "file.txt",
    encoding: Encoding.gzip,
  });
  t.deepEqual(Encoding.forPath("file.txt.br"), {
    basePath: "file.txt",
    encoding: Encoding.brotli,
  });
});

import { type Static, Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler"; // eslint-disable-line n/file-extension-in-import

const T = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
});

const C = TypeCompiler.Compile(T);

type TType = Static<typeof T>;

const val: TType = {
  x: 1,
  y: 2,
  z: 3,
};

console.log([...C.Errors(val)]);
console.log([...C.Errors({})]);

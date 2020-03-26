import { z } from "zod";

const T = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

type TType = z.infer<typeof T>;

const val: TType = {
  x: 1,
  y: 1,
  z: 1,
};

console.log(T.parse(val));

console.log(z.string().includes("omg").toUpperCase().parse("hello omg"));

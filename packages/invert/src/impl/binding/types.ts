import { type ReadonlyContainer } from "../../types.js";

export type Binding<T = unknown> = {
  getValue(factory: ReadonlyContainer): T;
};

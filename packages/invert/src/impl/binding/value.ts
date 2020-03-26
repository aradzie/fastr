import { type ReadonlyContainer } from "../../types.js";
import { type Binding } from "./types.js";

export class ValueBinding<T = unknown> implements Binding<T> {
  constructor(readonly value: T) {}

  getValue(container: ReadonlyContainer): T {
    return this.value;
  }

  get [Symbol.toStringTag](): string {
    return "ValueBinding";
  }
}

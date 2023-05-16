import { type ReadonlyContainer } from "../../types.js";
import { type Binding } from "./types.js";

export class FactoryBinding<T = unknown> implements Binding<T> {
  constructor(readonly factory: (container: ReadonlyContainer) => T) {}

  getValue(container: ReadonlyContainer): T {
    return this.factory(container);
  }

  get [Symbol.toStringTag](): string {
    return "FactoryBinding";
  }
}

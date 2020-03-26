import { type ReadonlyContainer } from "../../types.js";
import { type ProviderMetadata } from "../types.js";
import { getArgs } from "../util.js";
import { type Binding } from "./types.js";

export class ProviderBinding<T = unknown> implements Binding<T> {
  #value: T | undefined;

  constructor(readonly metadata: ProviderMetadata) {}

  getValue(factory: ReadonlyContainer): T {
    const { singleton, value, module, params } = this.metadata;
    const makeValue = (): T => {
      return Reflect.apply(value, module, getArgs(factory, params));
    };
    if (singleton) {
      let value = this.#value;
      if (value == null) {
        value = this.#value = makeValue();
      }
      return value;
    } else {
      return makeValue();
    }
  }

  get [Symbol.toStringTag](): string {
    return "ProviderBinding";
  }
}

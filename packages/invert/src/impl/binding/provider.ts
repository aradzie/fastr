import { type ReadonlyContainer } from "../../types.js";
import { type ProviderMetadata } from "../types.js";
import { getArgs } from "../util.js";
import { type Binding } from "./types.js";

export class ProviderBinding<T = unknown> implements Binding<T> {
  constructor(readonly metadata: ProviderMetadata) {}

  getValue(factory: ReadonlyContainer): T {
    // TODO singleton
    const { module, value, params } = this.metadata;
    return Reflect.apply(value, module, getArgs(factory, params));
  }

  get [Symbol.toStringTag](): string {
    return "ProviderBinding";
  }
}

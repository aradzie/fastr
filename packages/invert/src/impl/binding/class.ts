import { type ReadonlyContainer } from "../../types.js";
import { type ClassMetadata } from "../types.js";
import { getArgs } from "../util.js";
import { type Binding } from "./types.js";

export class ClassBinding<T = unknown> implements Binding<T> {
  constructor(readonly metadata: ClassMetadata) {}

  getValue(factory: ReadonlyContainer): T {
    // TODO singleton
    const { newable, params, props } = this.metadata;
    const value = Reflect.construct(newable, getArgs(factory, params));
    for (const { propertyKey, id, name } of props) {
      Reflect.set(value, propertyKey, factory.get(id, name));
    }
    return value;
  }

  get [Symbol.toStringTag](): string {
    return "ClassBinding";
  }
}

import { type ReadonlyContainer } from "../../types.js";
import { type ClassMetadata } from "../types.js";
import { getArgs } from "../util.js";
import { type Binding } from "./types.js";

export class ClassBinding<T = unknown> implements Binding<T> {
  private value: T | undefined;

  constructor(readonly metadata: ClassMetadata) {}

  getValue(factory: ReadonlyContainer): T {
    const { singleton, newable, params, props } = this.metadata;
    const makeValue = (): T => {
      const value = Reflect.construct(newable, getArgs(factory, params));
      for (const { propertyKey, id, name } of props) {
        Reflect.set(value, propertyKey, factory.get(id, name));
      }
      return value;
    };
    if (singleton) {
      let value = this.value;
      if (value == null) {
        value = this.value = makeValue();
      }
      return value;
    } else {
      return makeValue();
    }
  }

  get [Symbol.toStringTag](): string {
    return "ClassBinding";
  }
}

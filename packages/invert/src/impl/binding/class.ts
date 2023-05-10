import { type ReadonlyContainer } from "../../types.js";
import { type ClassMetadata } from "../types.js";
import { getArgs } from "../util.js";
import { type Binding } from "./types.js";

export class ClassBinding<T = unknown> implements Binding<T> {
  constructor(readonly metadata: ClassMetadata) {}

  getValue(factory: ReadonlyContainer): T {
    // TODO singleton
    const { newable, params } = this.metadata;
    return Reflect.construct(newable, getArgs(factory, params));
  }

  get [Symbol.toStringTag](): string {
    return "ClassBinding";
  }
}

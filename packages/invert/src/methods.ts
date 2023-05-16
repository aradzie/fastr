import { getConstructor, type PropertyKey, reflectorOf } from "@fastr/lang";
import { getArgs, getMethodParamsMetadata } from "./impl/util.js";
import { type MethodHandle, type ReadonlyContainer } from "./types.js";

export function methodHandle<T = unknown>(
  target: object,
  propertyKey: PropertyKey,
): MethodHandle<T> {
  const ref = reflectorOf(getConstructor(target));
  const method = ref.methods[propertyKey];
  if (method == null) {
    if (method == null) {
      throw new TypeError(
        `Method ${String(propertyKey)} ` +
          `is missing in class ${ref.newable.name}`,
      );
    }
  }
  const params = getMethodParamsMetadata(ref, method);
  return {
    apply(factory: ReadonlyContainer): T {
      return method.apply(target, getArgs(factory, params)) as T;
    },
  };
}

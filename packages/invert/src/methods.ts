import { getConstructor, kDesignParamTypes } from "@fastr/metadata";
import { kInject } from "./impl/constants.js";
import {
  type Callable,
  type InjectAnn,
  type ParamMetadata,
} from "./impl/types.js";
import { getArgs, mergeParams } from "./impl/util.js";
import { type MethodHandle, type ReadonlyContainer } from "./types.js";

export function methodHandle<T = unknown>(
  target: object,
  propertyKey: string | symbol,
): MethodHandle<T> {
  const constructor = getConstructor(target);
  const { prototype } = constructor;

  const callable = getCallable();
  const params = getParams();
  return {
    apply(factory: ReadonlyContainer): T {
      return Reflect.apply(callable, target, getArgs(factory, params));
    },
  };

  function getCallable(): Callable {
    const callable = prototype[propertyKey];
    if (callable == null) {
      throw new TypeError(
        `Property ${String(propertyKey)} ` +
          `is missing in class ${constructor.name}`,
      );
    }
    if (typeof callable !== "function") {
      throw new TypeError(
        `Property ${String(propertyKey)} ` +
          `is not a function in class ${constructor.name}`,
      );
    }
    return callable;
  }

  function getParams(): ParamMetadata[] {
    const paramTypes =
      Reflect.getMetadata(kDesignParamTypes, prototype, propertyKey) ?? [];
    if (callable.length !== paramTypes.length) {
      throw new Error(`Design types are missing on ${constructor.name}`);
    }
    const injectAnn = getInjectAnn(prototype, propertyKey);
    return mergeParams(callable, paramTypes, injectAnn);
  }
}

function getInjectAnn(
  target: object,
  propertyKey: string | symbol,
): readonly InjectAnn[] {
  return Reflect.getMetadata(kInject, target, propertyKey) ?? [];
}

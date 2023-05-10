import {
  getConstructor,
  kDesignParamTypes,
  kDesignReturnType,
  ownMethods,
} from "@fastr/metadata";
import { type Module, type ValueId } from "../types.js";
import { kInject, kProvides } from "./constants.js";
import {
  type Callable,
  type InjectAnn,
  type ParamMetadata,
  type ProviderMetadata,
  type ProvidesAnn,
} from "./types.js";
import { mergeParams } from "./util.js";

export function* getProviders(module: Module): Iterable<ProviderMetadata> {
  const constructor = getConstructor(module);
  const { prototype } = constructor;
  for (const [propertyKey, { value: callable }] of ownMethods(prototype)) {
    const providesAnn = getProvidesAnn(prototype, propertyKey);
    if (providesAnn != null) {
      const { id, name, singleton } = providesAnn;
      const type = getReturnType(propertyKey) as ValueId;
      const params = getParams(propertyKey, callable);
      yield {
        type,
        id: id ?? type,
        name,
        singleton,
        module,
        callable,
        params,
      };
    }
  }

  function getReturnType(propertyKey: string): unknown {
    const returnType = Reflect.getMetadata(
      kDesignReturnType,
      prototype,
      propertyKey,
    );
    if (returnType == null) {
      throw new Error(`Design types are missing on ${constructor.name}`);
    }
    return returnType;
  }

  function getParams<T>(
    propertyKey: string,
    callable: Callable,
  ): ParamMetadata[] {
    const paramTypes =
      Reflect.getMetadata(kDesignParamTypes, prototype, propertyKey) ?? [];
    if (callable.length !== paramTypes.length) {
      throw new Error(`Design types are missing on ${constructor.name}`);
    }
    const injectAnn = getInjectAnn(prototype, propertyKey);
    return mergeParams(callable, paramTypes, injectAnn);
  }
}

function getProvidesAnn(
  target: object,
  propertyKey: string | symbol,
): ProvidesAnn | null {
  return Reflect.getMetadata(kProvides, target, propertyKey) ?? null;
}

function getInjectAnn(
  target: object,
  propertyKey: string | symbol,
): readonly InjectAnn[] {
  return Reflect.getMetadata(kInject, target, propertyKey) ?? [];
}

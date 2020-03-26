import {
  type Callable,
  isConstructor,
  type Method,
  type Newable,
  type Reflector,
} from "@fastr/lang";
import { type ReadonlyContainer, type ValueId } from "../types.js";
import { kInject, kProp } from "./constants.js";
import {
  type InjectAnn,
  type ParamMetadata,
  type PropAnnRecord,
  type PropMetadata,
} from "./types.js";

export const getArgs = (
  factory: ReadonlyContainer,
  params: readonly ParamMetadata[],
): unknown[] => {
  return params.map(({ id, name }) => factory.get(id, name));
};

export const typeToValueId = (type: unknown): ValueId => {
  if (typeof type === "string" || typeof type === "symbol") {
    return type;
  }
  if (isConstructor(type)) {
    return type;
  }
  throw new TypeError(`Value ${type} cannot be used as a ValueId`);
};

const mergeParams = (
  callable: Newable | Callable,
  paramTypes: readonly unknown[],
  injectAnn: readonly InjectAnn[],
) => {
  const { length } = callable;
  const params = new Array<ParamMetadata>(length);
  for (let index = 0; index < length; index++) {
    const type = paramTypes[index];
    const ann = injectAnn[index];
    params[index] = {
      index,
      type,
      id: ann?.id ?? typeToValueId(type),
      name: ann?.name ?? null,
    };
  }
  return params;
};

export const getConstructorParamsMetadata = <T>(
  ref: Reflector,
): ParamMetadata[] => {
  const { newable, paramTypes } = ref;
  if (newable.length !== paramTypes.length) {
    throw new Error(`Design types are missing on ${newable.name}`);
  }
  const injectAnn = ref.getOwnMetadata<InjectAnn[]>(kInject) ?? [];
  return mergeParams(newable, paramTypes, injectAnn);
};

export const getMethodParamsMetadata = (
  ref: Reflector,
  method: Method,
): ParamMetadata[] => {
  const { newable } = ref;
  const { paramTypes, value } = method;
  if (value.length !== paramTypes.length) {
    throw new Error(`Design types are missing on ${newable.name}`);
  }
  const injectAnn = method.getOwnMetadata<InjectAnn[]>(kInject) ?? [];
  return mergeParams(value, paramTypes, injectAnn);
};

export const getPropsMetadata = (ref: Reflector): PropMetadata[] => {
  const { newable } = ref;
  const metadata = new Array<PropMetadata>();
  const propAnn = ref.getOwnMetadata<PropAnnRecord>(kProp) ?? {};
  for (const property of Object.values(ref.properties)) {
    const { key, type } = property;
    if (type == null) {
      throw new Error(`Design types are missing on ${newable.name}`);
    }
    const ann = propAnn[key];
    metadata.push({
      propertyKey: key,
      type,
      id: ann?.id ?? typeToValueId(type),
      name: ann?.name ?? null,
    });
  }
  return metadata;
};

export const checkValueId = (id: unknown, name: unknown): void => {
  if ((id == null || id === Object) && name == null) {
    throw new TypeError();
  }
};

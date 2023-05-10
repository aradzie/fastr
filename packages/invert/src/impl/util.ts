import { type Newable } from "@fastr/metadata";
import { type ReadonlyContainer } from "../types.js";
import { type Callable, type InjectAnn, type ParamMetadata } from "./types.js";

export const getArgs = (
  factory: ReadonlyContainer,
  params: readonly ParamMetadata[],
): unknown[] => {
  return params.map(({ id, name }) => factory.get(id, name));
};

export function mergeParams(
  callable: Newable<any> | Callable,
  paramTypes: readonly unknown[],
  injectAnn: readonly InjectAnn[],
) {
  const { length } = callable;
  const params = new Array<ParamMetadata>(length);
  for (let index = 0; index < length; index++) {
    const type = paramTypes[index];
    const metadata = injectAnn[index];
    params[index] = {
      index,
      type,
      id: metadata?.id ?? type,
      name: metadata?.name ?? null,
    };
  }
  return params;
}

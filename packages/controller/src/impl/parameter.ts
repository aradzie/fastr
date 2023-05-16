import { type Newable } from "@fastr/core";
import { type Reflector } from "@fastr/metadata";
import { type Pipe } from "../pipe.js";
import { getStandardExtractor, type ParameterExtractor } from "./context.js";
import { setParameterMetadata } from "./metadata.js";
import { type PropertyKey } from "./types.js";

export const makeParameterDecorator = (
  extractor: ParameterExtractor,
  key: string | null,
  pipe: Newable<Pipe> | null,
) => {
  return ((
    target: object,
    propertyKey: PropertyKey,
    parameterIndex: number,
  ): void => {
    setParameterMetadata(target, propertyKey, {
      parameterIndex,
      extractor,
      key,
      pipe,
    });
  }) as ParameterDecorator;
};

export const annotateParameters = (ref: Reflector): void => {
  const { prototype } = ref.newable;
  for (const { key, value, paramTypes } of Object.values(ref.methods)) {
    if (value.length !== paramTypes.length) {
      throw new Error(`Design types are missing on ${ref.newable.name}`);
    }
    for (let i = 0; i < value.length; i++) {
      const extractor = getStandardExtractor(paramTypes[i]);
      if (extractor != null) {
        setParameterMetadata(prototype, key, {
          parameterIndex: i,
          extractor,
          key: null,
          pipe: null,
        });
      }
    }
  }
};

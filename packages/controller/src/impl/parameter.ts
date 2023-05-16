import { type Newable, type PropertyKey, type Reflector } from "@fastr/lang";
import { type Pipe } from "../pipe.js";
import { getStandardExtractor, type ParameterExtractor } from "./context.js";
import { getHandlerMetadata, setParameterMetadata } from "./metadata.js";

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
    const handlerMetadata = getHandlerMetadata(prototype, key);
    if (handlerMetadata == null) {
      continue;
    }
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
      } else {
        // TODO throw new TypeError();
      }
    }
  }
};

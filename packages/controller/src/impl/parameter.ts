import { type PropertyKey, type Reflector } from "@fastr/lang";
import { type AnyPipe, type Pipe, toPipe } from "../pipe.js";
import { getStandardProvider, type ParameterProvider } from "./context.js";
import { getHandlerMetadata, setParameterMetadata } from "./metadata.js";

export const makeParameterDecorator = (
  provider: ParameterProvider,
  key: string | null,
  anyPipe: AnyPipe | null,
): ParameterDecorator => {
  let pipe: Pipe | null = null;
  if (anyPipe != null) {
    pipe = toPipe(anyPipe);
  }
  return (
    target: object,
    propertyKey: PropertyKey | undefined,
    parameterIndex: number,
  ): void => {
    if (propertyKey == null) {
      // Cannot be used on a constructor parameter.
      throw new TypeError();
    }
    setParameterMetadata(target, propertyKey, {
      parameterIndex,
      provider,
      key,
      pipe,
    });
  };
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
      const provider = getStandardProvider(paramTypes[i]);
      if (provider != null) {
        setParameterMetadata(prototype, key, {
          parameterIndex: i,
          provider,
          key: null,
          pipe: null,
        });
      }
    }
  }
};

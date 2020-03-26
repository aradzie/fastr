import { type AnyMiddleware } from "@fastr/core";
import { addControllerUse, addHandlerUse } from "../metadata.js";

export function use(
  ...middleware: readonly AnyMiddleware[]
) /* : ClassDecorator | MethodDecorator */ {
  return (...args: any[]): void => {
    if (args.length === 1) {
      return useOnClass(args[0]);
    }
    if (args.length === 3) {
      return useOnMethod(args[0], args[1], args[2]);
    }
    throw new TypeError();
  };

  function useOnClass(target: object): void {
    addControllerUse(target, ...middleware);
  }

  function useOnMethod(
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    addHandlerUse(target, propertyKey, ...middleware);
  }
}

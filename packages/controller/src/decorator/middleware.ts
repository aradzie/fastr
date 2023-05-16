import { type AnyMiddleware } from "@fastr/core";
import { type PropertyKey } from "@fastr/lang";
import { addControllerUse, addHandlerUse } from "../impl/metadata.js";

export function use(
  ...middleware: readonly AnyMiddleware[]
) /* : ClassDecorator | MethodDecorator */ {
  const classDecorator = (target: object): void => {
    addControllerUse(target, ...middleware);
  };

  const methodDecorator = (
    target: object,
    propertyKey: PropertyKey,
    descriptor: PropertyDescriptor,
  ): void => {
    addHandlerUse(target, propertyKey, ...middleware);
  };

  return (...args: any[]): void => {
    if (args.length === 1) {
      return classDecorator(args[0]);
    }
    if (args.length === 3) {
      return methodDecorator(args[0], args[1], args[2]);
    }
    throw new TypeError();
  };
}

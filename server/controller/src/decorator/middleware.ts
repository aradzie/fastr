import { MiddlewareId } from "@webfx/middleware";
import { addControllerUse, addHandlerUse } from "../metadata";

export function use(...middleware: MiddlewareId[]) {
  return (...args: any[]) => {
    if (args.length == 1) {
      return useOnClass(args[0]);
    }
    if (args.length == 3) {
      return useOnMethod(args[0], args[1], args[2]);
    }
    throw new TypeError();
  };

  function useOnClass(target: Function) {
    addControllerUse(target, ...middleware);
  }

  function useOnMethod(
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    addHandlerUse(target, propertyKey, ...middleware);
  }
}

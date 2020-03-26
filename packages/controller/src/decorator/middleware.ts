import { type AnyMiddleware } from "@fastr/core";
import {
  isClassDecorator,
  isMethodDecorator,
  type PropertyKey,
} from "@fastr/lang";
import { addControllerUse, addHandlerUse } from "../impl/metadata.js";

export const use = (...middleware: readonly AnyMiddleware[]) => {
  return (
    target: object,
    propertyKey?: PropertyKey,
    descriptor?: PropertyDescriptor,
  ): void => {
    if (isClassDecorator(target, propertyKey, descriptor)) {
      addControllerUse(target, ...middleware);
      return;
    }
    if (isMethodDecorator(target, propertyKey, descriptor)) {
      addHandlerUse(target, propertyKey!, ...middleware);
      return;
    }
    throw new TypeError();
  };
};

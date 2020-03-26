import {
  isParameterDecorator,
  isPropertyDecorator,
  type PropertyKey,
  reflectorOf,
} from "@fastr/lang";
import { type Name } from "../types.js";
import { tagParameter, tagProperty } from "./impl.js";
import { kNameTag } from "./tags.js";

const createDecorator = (name: Name, value: Name) => {
  return (
    target: object,
    propertyKey?: PropertyKey,
    parameterIndex?: number,
  ) => {
    if (isParameterDecorator(target, propertyKey, parameterIndex)) {
      tagParameter(target, propertyKey, parameterIndex!, name, value);
      return;
    }
    if (isPropertyDecorator(target, propertyKey, parameterIndex)) {
      reflectorOf.addPropertyKey(target, propertyKey!);
      tagProperty(target, propertyKey!, name, value);
      return;
    }
    throw new TypeError();
  };
};

export const named = (name: Name) => {
  return createDecorator(kNameTag, name);
};

export const tagged = (name: Name, value: Name) => {
  return createDecorator(name, value);
};

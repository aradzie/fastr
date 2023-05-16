import { type PropertyKey, reflectorOf } from "@fastr/lang";
import { type Name } from "../types.js";
import { tagParameter, tagProperty } from "./impl.js";
import { kNameTag } from "./tags.js";

export const named = (name: Name) => {
  return (
    target: object,
    propertyKey?: PropertyKey,
    parameterIndex?: number | PropertyDescriptor,
  ) => {
    if (typeof parameterIndex === "number") {
      tagParameter(target, propertyKey, parameterIndex, kNameTag, name);
    } else {
      if (propertyKey != null) {
        reflectorOf.addPropertyKey(target, propertyKey);
      }
      tagProperty(target, propertyKey, kNameTag, name);
    }
  };
};

export const tagged = (name: Name, value: Name) => {
  return (
    target: object,
    propertyKey?: PropertyKey,
    parameterIndex?: number | PropertyDescriptor,
  ) => {
    if (typeof parameterIndex === "number") {
      tagParameter(target, propertyKey, parameterIndex, name, value);
    } else {
      if (propertyKey != null) {
        reflectorOf.addPropertyKey(target, propertyKey);
      }
      tagProperty(target, propertyKey, name, value);
    }
  };
};

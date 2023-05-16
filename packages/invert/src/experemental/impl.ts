import { type PropertyKey } from "@fastr/lang";
import { type Name } from "../types.js";
import { addTag, type TagMap } from "./tags.js";

const kPropertyTags = Symbol("kPropertyTags");
const kParameterTags = Symbol("kParameterTags");
const newMap = (): TagMap => Object.create(null);
const { getMetadata, defineMetadata } = Reflect;

export const tagParameter = (
  target: object,
  propertyKey: PropertyKey | undefined,
  parameterIndex: number,
  name: Name,
  value: Name,
): void => {
  let list: TagMap[];
  if (propertyKey != null) {
    list = getMetadata(kParameterTags, target, propertyKey) as TagMap[];
    if (list == null) {
      defineMetadata(kParameterTags, (list = []), target, propertyKey);
    }
  } else {
    list = getMetadata(kParameterTags, target) as TagMap[];
    if (list == null) {
      defineMetadata(kParameterTags, (list = []), target);
    }
  }
  let map = list[parameterIndex];
  if (map == null) {
    list[parameterIndex] = map = newMap();
  }
  addTag(map, name, value);
};

export const tagProperty = (
  target: object,
  propertyKey: PropertyKey | undefined,
  name: Name,
  value: Name,
): void => {
  let map: TagMap;
  if (propertyKey != null) {
    map = getMetadata(kPropertyTags, target, propertyKey) as TagMap;
    if (map == null) {
      defineMetadata(kPropertyTags, (map = newMap()), target, propertyKey);
    }
  } else {
    map = getMetadata(kPropertyTags, target) as TagMap;
    if (map == null) {
      defineMetadata(kPropertyTags, (map = newMap()), target);
    }
  }
  addTag(map, name, value);
};

export const getParameterTags = (
  target: object,
  propertyKey: PropertyKey | undefined,
): readonly TagMap[] => {
  if (propertyKey != null) {
    return getMetadata(kParameterTags, target, propertyKey) ?? [];
  } else {
    return getMetadata(kParameterTags, target) ?? [];
  }
};

export const getPropertyTags = (
  target: object,
  propertyKey: PropertyKey | undefined,
): TagMap | null => {
  if (propertyKey != null) {
    return getMetadata(kPropertyTags, target, propertyKey) ?? null;
  } else {
    return getMetadata(kPropertyTags, target) ?? null;
  }
};

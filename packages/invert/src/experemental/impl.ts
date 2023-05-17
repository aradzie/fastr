import { getOwnMetadata, type PropertyKey, setMetadata } from "@fastr/lang";
import { type Name } from "../types.js";
import { addTag, type TagMap } from "./tags.js";

const kPropertyTags = Symbol("kPropertyTags");
const kParameterTags = Symbol("kParameterTags");
const newMap = (): TagMap => Object.create(null);

export const tagParameter = (
  target: object,
  propertyKey: PropertyKey | undefined,
  parameterIndex: number,
  name: Name,
  value: Name,
): void => {
  let list = getOwnMetadata(kParameterTags, target, propertyKey) as TagMap[];
  if (list == null) {
    setMetadata(kParameterTags, (list = []), target, propertyKey);
  }
  let map = list[parameterIndex];
  if (map == null) {
    list[parameterIndex] = map = newMap();
  }
  addTag(map, name, value);
};

export const tagProperty = (
  target: object,
  propertyKey: PropertyKey,
  name: Name,
  value: Name,
): void => {
  let map = getOwnMetadata(kPropertyTags, target, propertyKey) as TagMap;
  if (map == null) {
    setMetadata(kPropertyTags, (map = newMap()), target, propertyKey);
  }
  addTag(map, name, value);
};

export const getParameterTags = (
  target: object,
  propertyKey: PropertyKey | undefined,
): readonly TagMap[] => {
  return getOwnMetadata(kParameterTags, target, propertyKey) ?? [];
};

export const getPropertyTags = (
  target: object,
  propertyKey: PropertyKey,
): TagMap | null => {
  return getOwnMetadata(kPropertyTags, target, propertyKey) ?? null;
};

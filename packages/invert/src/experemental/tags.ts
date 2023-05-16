import { type Name } from "../types.js";

export type TagMap = Record<Name, Name>;

export const kNameTag = Symbol("kNameTag");

export const addTag = (map: TagMap, name: Name, value: Name): void => {
  if (name in map) {
    throw new Error(`Duplicate tag ${String(name)}`);
  }
  map[name] = value;
};

import { type MetadataKey, type PropertyKey } from "./types.js";

export const hasMetadata = (
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: PropertyKey | null,
): boolean => {
  if (propertyKey != null) {
    return Reflect.hasMetadata(metadataKey, target, propertyKey);
  } else {
    return Reflect.hasMetadata(metadataKey, target);
  }
};

export const hasOwnMetadata = (
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: PropertyKey | null,
): boolean => {
  if (propertyKey != null) {
    return Reflect.hasOwnMetadata(metadataKey, target, propertyKey);
  } else {
    return Reflect.hasOwnMetadata(metadataKey, target);
  }
};

export const getMetadata = <T = any>(
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: PropertyKey | null,
): T => {
  if (propertyKey != null) {
    return Reflect.getMetadata(metadataKey, target, propertyKey) as T;
  } else {
    return Reflect.getMetadata(metadataKey, target) as T;
  }
};

export const getOwnMetadata = <T = any>(
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: PropertyKey | null,
): T => {
  if (propertyKey != null) {
    return Reflect.getOwnMetadata(metadataKey, target, propertyKey) as T;
  } else {
    return Reflect.getOwnMetadata(metadataKey, target) as T;
  }
};

export const setMetadata = <T = any>(
  metadataKey: MetadataKey,
  metadataValue: T,
  target: object,
  propertyKey?: PropertyKey | null,
): void => {
  if (propertyKey != null) {
    Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
  } else {
    Reflect.defineMetadata(metadataKey, metadataValue, target);
  }
};

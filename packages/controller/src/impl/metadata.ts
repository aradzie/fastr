import { type AnyMiddleware, type Newable } from "@fastr/core";
import {
  newMetadataKey,
  objectMetadata,
  propertyMetadata,
} from "@fastr/metadata";
import { type Pipe } from "../pipe.js";
import { type ParameterExtractor } from "./context.js";
import { type PropertyKey } from "./types.js";

export type ControllerMetadata = {
  readonly path: string;
};

export type HandlerMetadata = {
  readonly method: string;
  readonly path: string;
  readonly name: string | null;
};

export type ParameterMetadata = {
  readonly parameterIndex: number;
  readonly extractor: ParameterExtractor;
  readonly key: string | null;
  readonly pipe: Newable<Pipe> | null;
};

const kUseMiddleware = newMetadataKey<AnyMiddleware[]>(Symbol());
const kController = newMetadataKey<ControllerMetadata>(Symbol());
const kHandler = newMetadataKey<HandlerMetadata>(Symbol());
const kParameter = newMetadataKey<ParameterMetadata[]>(Symbol());

export const addControllerUse = (
  target: object,
  ...middleware: AnyMiddleware[]
): void =>
  objectMetadata(target) //
    .update(kUseMiddleware, (list = []) => {
      list.unshift(...middleware);
      return list;
    });

export const getControllerUse = (target: object): readonly AnyMiddleware[] => {
  return objectMetadata(target).get(kUseMiddleware) ?? [];
};

export const addHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
  ...middleware: AnyMiddleware[]
): void =>
  propertyMetadata(target, propertyKey) //
    .update(kUseMiddleware, (list = []) => {
      list.unshift(...middleware);
      return list;
    });

export const getHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
): readonly AnyMiddleware[] => {
  return (
    propertyMetadata(target, propertyKey) //
      .get(kUseMiddleware) ?? []
  );
};

export const setControllerMetadata = (
  target: object,
  metadata: ControllerMetadata,
): void => {
  objectMetadata(target).set(kController, metadata);
};

export const getControllerMetadata = (
  target: object,
): ControllerMetadata | null => {
  return objectMetadata(target).get(kController) ?? null;
};

export const setHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: HandlerMetadata,
): void => {
  propertyMetadata(target, propertyKey) //
    .set(kHandler, metadata);
};

export const getHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
): HandlerMetadata | null => {
  return (
    propertyMetadata(target, propertyKey) //
      .get(kHandler) ?? null
  );
};

export const setParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: ParameterMetadata,
): void => {
  propertyMetadata(target, propertyKey) //
    .update(kParameter, (list = []) => {
      list[metadata.parameterIndex] = metadata;
      return list;
    });
};

export const getParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
): readonly ParameterMetadata[] => {
  return (
    propertyMetadata(target, propertyKey) //
      .get(kParameter) ?? []
  );
};

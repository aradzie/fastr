import { type AnyMiddleware } from "@fastr/core";
import { type Newable, type PropertyKey } from "@fastr/lang";
import { type Pipe } from "../pipe.js";
import { type ParameterExtractor } from "./context.js";
import { defineMetadata, getMetadata, hasMetadata } from "./reflect.js";

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

const kUseMiddleware = Symbol("kUseMiddleware");
const kController = Symbol("kController");
const kHandler = Symbol("kHandler");
const kParameter = Symbol("kParameter");

export const addControllerUse = (
  target: object,
  ...middleware: readonly AnyMiddleware[]
): void => {
  let list: AnyMiddleware[] = getMetadata(kUseMiddleware, target);
  if (list == null) {
    defineMetadata(kUseMiddleware, (list = []), target);
  }
  list.unshift(...middleware);
};

export const getControllerUse = (target: object): readonly AnyMiddleware[] => {
  return getMetadata(kUseMiddleware, target) ?? [];
};

export const addHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
  ...middleware: readonly AnyMiddleware[]
): void => {
  let list: AnyMiddleware[] = getMetadata(kUseMiddleware, target, propertyKey);
  if (list == null) {
    defineMetadata(kUseMiddleware, (list = []), target, propertyKey);
  }
  list.unshift(...middleware);
};

export const getHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
): readonly AnyMiddleware[] => {
  return getMetadata(kUseMiddleware, target, propertyKey) ?? [];
};

export const setControllerMetadata = (
  target: object,
  metadata: ControllerMetadata,
): void => {
  if (hasMetadata(kController, target)) {
    throw new TypeError();
  }
  defineMetadata(kController, metadata, target);
};

export const getControllerMetadata = (
  target: object,
): ControllerMetadata | null => {
  return getMetadata(kController, target) ?? null;
};

export const setHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: HandlerMetadata,
): void => {
  if (hasMetadata(kHandler, target, propertyKey)) {
    throw new TypeError();
  }
  defineMetadata(kHandler, metadata, target, propertyKey);
};

export const getHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
): HandlerMetadata | null => {
  return getMetadata(kHandler, target, propertyKey) ?? null;
};

export const setParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: ParameterMetadata,
): void => {
  let list: ParameterMetadata[] = getMetadata(kParameter, target, propertyKey);
  if (list == null) {
    defineMetadata(kParameter, (list = []), target, propertyKey);
  }
  list[metadata.parameterIndex] = metadata;
};

export const getParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
): readonly ParameterMetadata[] => {
  return getMetadata(kParameter, target, propertyKey) ?? [];
};

import { type AnyMiddleware } from "@fastr/core";
import {
  getOwnMetadata,
  hasOwnMetadata,
  type PropertyKey,
  setMetadata,
} from "@fastr/lang";
import { type Pipe } from "../pipe.js";
import { type ParameterProvider } from "./context.js";

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
  readonly provider: ParameterProvider;
  readonly key: string | null;
  readonly pipe: Pipe | null;
};

const kUseMiddleware = Symbol("kUseMiddleware");
const kController = Symbol("kController");
const kHandler = Symbol("kHandler");
const kParameter = Symbol("kParameter");

export const addControllerUse = (
  target: object,
  ...middleware: readonly AnyMiddleware[]
): void => {
  let list: AnyMiddleware[] = getOwnMetadata(kUseMiddleware, target);
  if (list == null) {
    setMetadata(kUseMiddleware, (list = []), target);
  }
  list.unshift(...middleware);
};

export const getControllerUse = (target: object): readonly AnyMiddleware[] => {
  return getOwnMetadata(kUseMiddleware, target) ?? [];
};

export const addHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
  ...middleware: readonly AnyMiddleware[]
): void => {
  let list: AnyMiddleware[] = getOwnMetadata(
    kUseMiddleware,
    target,
    propertyKey,
  );
  if (list == null) {
    setMetadata(kUseMiddleware, (list = []), target, propertyKey);
  }
  list.unshift(...middleware);
};

export const getHandlerUse = (
  target: object,
  propertyKey: PropertyKey,
): readonly AnyMiddleware[] => {
  return getOwnMetadata(kUseMiddleware, target, propertyKey) ?? [];
};

export const setControllerMetadata = (
  target: object,
  metadata: ControllerMetadata,
): void => {
  if (hasOwnMetadata(kController, target)) {
    throw new TypeError();
  }
  setMetadata(kController, metadata, target);
};

export const getControllerMetadata = (
  target: object,
): ControllerMetadata | null => {
  return getOwnMetadata(kController, target) ?? null;
};

export const setHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: HandlerMetadata,
): void => {
  if (hasOwnMetadata(kHandler, target, propertyKey)) {
    throw new TypeError();
  }
  setMetadata(kHandler, metadata, target, propertyKey);
};

export const getHandlerMetadata = (
  target: object,
  propertyKey: PropertyKey,
): HandlerMetadata | null => {
  return getOwnMetadata(kHandler, target, propertyKey) ?? null;
};

export const setParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
  metadata: ParameterMetadata,
): void => {
  let list: ParameterMetadata[] = getOwnMetadata(
    kParameter,
    target,
    propertyKey,
  );
  if (list == null) {
    setMetadata(kParameter, (list = []), target, propertyKey);
  }
  list[metadata.parameterIndex] = metadata;
};

export const getParameterMetadata = (
  target: object,
  propertyKey: PropertyKey,
): readonly ParameterMetadata[] => {
  return getOwnMetadata(kParameter, target, propertyKey) ?? [];
};

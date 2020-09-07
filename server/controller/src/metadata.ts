import type { RouterContext } from "@webfx-middleware/router";
import type { MiddlewareId } from "@webfx/middleware";
import type { IPipe } from "./pipe.js";
import type { Type } from "./types.js";
import { Metadata, newMetadataKey } from "./util.js";

export interface ControllerDecorator extends ClassDecorator {}

export interface HandlerDecorator extends MethodDecorator {}

export interface ControllerMetadata {
  readonly path: string;
}

export interface HandlerMetadata {
  readonly method: string;
  readonly path: string;
  readonly name: string | null;
}

export interface ParameterMetadata {
  readonly parameterIndex: number;
  readonly extractor: ParameterExtractor;
  readonly key: string | null;
  readonly pipe: Type<IPipe> | null;
}

export interface ParameterExtractor {
  (ctx: RouterContext, key: string | null): any;
}

const kUseMiddleware = newMetadataKey<MiddlewareId[]>(
  Symbol("use-middleware-metadata"),
);
const kController = newMetadataKey<ControllerMetadata>(
  Symbol("controller-metadata"),
);
const kHandler = newMetadataKey<HandlerMetadata>(Symbol("handler-metadata"));
const kParameter = newMetadataKey<ParameterMetadata[]>(
  Symbol("parameter-metadata"),
);

export function addControllerUse(
  target: Function,
  ...middleware: MiddlewareId[]
): void {
  Metadata.forClass(target).update(kUseMiddleware, (list = []) => {
    list.unshift(...middleware);
    return list;
  });
}

export function getControllerUse(target: Function): readonly MiddlewareId[] {
  return Metadata.forClass(target).get(kUseMiddleware) ?? [];
}

export function addHandlerUse(
  target: object,
  propertyKey: string | symbol,
  ...middleware: MiddlewareId[]
): void {
  Metadata.forProperty(target, propertyKey).update(
    kUseMiddleware,
    (list = []) => {
      list.unshift(...middleware);
      return list;
    },
  );
}

export function getHandlerUse(
  target: object,
  propertyKey: string | symbol,
): readonly MiddlewareId[] {
  return Metadata.forProperty(target, propertyKey).get(kUseMiddleware) ?? [];
}

export function setControllerMetadata(
  target: Function,
  metadata: ControllerMetadata,
): void {
  Metadata.forClass(target).set(kController, metadata);
}

export function getControllerMetadata(
  target: Function,
): ControllerMetadata | null {
  return Metadata.forClass(target).get(kController) ?? null;
}

export function setHandlerMetadata(
  target: object,
  propertyKey: string | symbol,
  metadata: HandlerMetadata,
): void {
  Metadata.forProperty(target, propertyKey).set(kHandler, metadata);
}

export function getHandlerMetadata(
  target: object,
  propertyKey: string | symbol,
): HandlerMetadata | null {
  return Metadata.forProperty(target, propertyKey).get(kHandler) ?? null;
}

export function setParameterMetadata(
  target: object,
  propertyKey: string | symbol,
  metadata: ParameterMetadata,
): void {
  Metadata.forProperty(target, propertyKey).update(kParameter, (list = []) => {
    list[metadata.parameterIndex] = metadata;
    return list;
  });
}

export function getParameterMetadata(
  target: object,
  propertyKey: string | symbol,
): readonly ParameterMetadata[] {
  return Metadata.forProperty(target, propertyKey).get(kParameter) ?? [];
}

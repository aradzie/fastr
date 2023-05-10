import { type AnyMiddleware, type Context, type Newable } from "@fastr/core";
import { Metadata, newMetadataKey } from "@fastr/metadata";
import { type RouterState } from "@fastr/middleware-router";
import { type Pipe } from "./pipe.js";

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
  readonly pipe: Newable<Pipe> | null;
}

export interface ParameterExtractor {
  (ctx: Context<RouterState>, key: string | null): any;
}

const kUseMiddleware = newMetadataKey<AnyMiddleware[]>(Symbol());
const kController = newMetadataKey<ControllerMetadata>(Symbol());
const kHandler = newMetadataKey<HandlerMetadata>(Symbol());
const kParameter = newMetadataKey<ParameterMetadata[]>(Symbol());

export function addControllerUse(
  target: object,
  ...middleware: AnyMiddleware[]
): void {
  Metadata.ofClass(target) //
    .update(kUseMiddleware, (list = []) => {
      list.unshift(...middleware);
      return list;
    });
}

export function getControllerUse(target: object): readonly AnyMiddleware[] {
  return Metadata.ofClass(target).get(kUseMiddleware) ?? [];
}

export function addHandlerUse(
  target: object,
  propertyKey: string | symbol,
  ...middleware: AnyMiddleware[]
): void {
  Metadata.ofProperty(target, propertyKey) //
    .update(kUseMiddleware, (list = []) => {
      list.unshift(...middleware);
      return list;
    });
}

export function getHandlerUse(
  target: object,
  propertyKey: string | symbol,
): readonly AnyMiddleware[] {
  return (
    Metadata.ofProperty(target, propertyKey) //
      .get(kUseMiddleware) ?? []
  );
}

export function setControllerMetadata(
  target: object,
  metadata: ControllerMetadata,
): void {
  Metadata.ofClass(target).set(kController, metadata);
}

export function getControllerMetadata(
  target: object,
): ControllerMetadata | null {
  return Metadata.ofClass(target).get(kController) ?? null;
}

export function setHandlerMetadata(
  target: object,
  propertyKey: string | symbol,
  metadata: HandlerMetadata,
): void {
  Metadata.ofProperty(target, propertyKey) //
    .set(kHandler, metadata);
}

export function getHandlerMetadata(
  target: object,
  propertyKey: string | symbol,
): HandlerMetadata | null {
  return (
    Metadata.ofProperty(target, propertyKey) //
      .get(kHandler) ?? null
  );
}

export function setParameterMetadata(
  target: object,
  propertyKey: string | symbol,
  metadata: ParameterMetadata,
): void {
  Metadata.ofProperty(target, propertyKey) //
    .update(kParameter, (list = []) => {
      list[metadata.parameterIndex] = metadata;
      return list;
    });
}

export function getParameterMetadata(
  target: object,
  propertyKey: string | symbol,
): readonly ParameterMetadata[] {
  return (
    Metadata.ofProperty(target, propertyKey) //
      .get(kParameter) ?? []
  );
}

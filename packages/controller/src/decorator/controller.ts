import { Context, type Newable, Request, Response } from "@fastr/core";
import { Router } from "@fastr/middleware-router";
import { Container } from "@sosimple/inversify";
import {
  getContainer,
  getContext,
  getRequest,
  getResponse,
  getRouter,
} from "../context.js";
import {
  type ControllerDecorator,
  setControllerMetadata,
  setParameterMetadata,
} from "../metadata.js";
import { type HandlerOptions } from "./handler.js";

export interface ControllerOptions {
  readonly path?: string;
}

export function controller(path?: string): ControllerDecorator;
export function controller(options?: ControllerOptions): ControllerDecorator;
export function controller(
  arg0?: string | ControllerOptions,
): ControllerDecorator {
  const { path } = makeOptions(arg0);
  return (target: object): void => {
    setControllerMetadata(target, {
      path,
    });
    annotateProperties(target as Newable);
  };
}

const kDesignType = "design:type";
const kDesignParamTypes = "design:paramtypes";
const hasOwn = Reflect.hasOwnMetadata;
const getOwn = Reflect.getOwnMetadata;

function annotateProperties(target: object): void {
  const { prototype } = target as Newable;

  for (const [propertyKey, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(prototype),
  )) {
    if (
      !hasOwn(kDesignType, prototype, propertyKey) ||
      !hasOwn(kDesignParamTypes, prototype, propertyKey) ||
      typeof descriptor.value !== "function"
    ) {
      continue;
    }

    const designType = getOwn(kDesignType, prototype, propertyKey);
    const designParamTypes = getOwn(kDesignParamTypes, prototype, propertyKey);

    if (designType !== Function) {
      continue;
    }

    const { length } = designParamTypes;
    for (let i = 0; i < length; i++) {
      const designParamType = designParamTypes[i];
      switch (designParamType) {
        case Context:
          setParameterMetadata(prototype, propertyKey, {
            parameterIndex: i,
            extractor: getContext,
            key: null,
            pipe: null,
          });
          break;

        case Container:
          setParameterMetadata(prototype, propertyKey, {
            parameterIndex: i,
            extractor: getContainer,
            key: null,
            pipe: null,
          });
          break;

        case Request:
          setParameterMetadata(prototype, propertyKey, {
            parameterIndex: i,
            extractor: getRequest,
            key: null,
            pipe: null,
          });
          break;

        case Response:
          setParameterMetadata(prototype, propertyKey, {
            parameterIndex: i,
            extractor: getResponse,
            key: null,
            pipe: null,
          });
          break;

        case Router:
          setParameterMetadata(prototype, propertyKey, {
            parameterIndex: i,
            extractor: getRouter,
            key: null,
            pipe: null,
          });
          break;
      }
    }
  }
}

function makeOptions(options?: string | HandlerOptions): {
  readonly path: string;
} {
  let path = "/";
  if (typeof options === "string") {
    path = options;
  } else if (options != null && typeof options === "object") {
    if (typeof options.path === "string") {
      path = options.path;
    }
  }
  if (!path.startsWith("/") || (path !== "/" && path.endsWith("/"))) {
    throw new Error(`Invalid path '${path}'`);
  }
  return { path };
}

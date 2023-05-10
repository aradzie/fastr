import { Context, type Newable, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";
import { kDesignParamTypes, ownMethods } from "@fastr/metadata";
import { Router } from "@fastr/middleware-router";
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
  const options = makeOptions(arg0);
  return ((target: Newable): void => {
    setControllerMetadata(target, options);
    const { prototype } = target;
    for (const [propertyKey, { value }] of ownMethods(prototype)) {
      const paramTypes =
        Reflect.getMetadata(kDesignParamTypes, prototype, propertyKey) ?? [];
      if (value.length !== paramTypes.length) {
        throw new Error(`Design types are missing on ${target.name}`);
      }
      for (let i = 0; i < value.length; i++) {
        switch (paramTypes[i]) {
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
  }) as ControllerDecorator;
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

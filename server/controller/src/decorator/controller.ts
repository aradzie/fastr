import { ControllerDecorator, setControllerMetadata } from "../metadata";
import type { HandlerOptions } from "./handler";

export interface ControllerOptions {
  readonly path?: string;
}

export function controller(path?: string): ControllerDecorator;
export function controller(options?: ControllerOptions): ControllerDecorator;
export function controller(
  arg0?: string | ControllerOptions,
): ControllerDecorator {
  const { path } = makeOptions(arg0);
  return (target: Function) => {
    setControllerMetadata(target, {
      path,
    });
  };
}

function makeOptions(
  options?: string | HandlerOptions,
): {
  readonly path: string;
} {
  let path = "/";
  if (typeof options === "string") {
    path = options;
  } else if (options) {
    if (typeof options.path === "string") {
      path = options.path;
    }
  }
  if (!path.startsWith("/") || (path !== "/" && path.endsWith("/"))) {
    throw new Error(`Invalid path '${path}'`);
  }
  return { path };
}

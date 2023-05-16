import { type Newable, reflectorOf } from "@fastr/lang";
import { setControllerMetadata } from "../impl/metadata.js";
import { annotateParameters } from "../impl/parameter.js";
import { type HandlerOptions } from "./handler.js";

export interface ControllerOptions {
  readonly path?: string;
}

export function controller(path?: string): ClassDecorator;
export function controller(options?: ControllerOptions): ClassDecorator;
export function controller(arg0?: string | ControllerOptions): ClassDecorator {
  const options = makeOptions(arg0);
  return (target: object): void => {
    setControllerMetadata(target, options);
    annotateParameters(reflectorOf(target as Newable));
  };
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

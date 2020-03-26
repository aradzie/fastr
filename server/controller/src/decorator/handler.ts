import { HandlerDecorator, setHandlerMetadata } from "../metadata";

export interface HandlerOptions {
  readonly path?: string;
  readonly name?: string; // TODO take route name from method name?
}

export namespace http {
  export function any(path?: string): HandlerDecorator;
  export function any(options?: HandlerOptions): HandlerDecorator;
  export function any(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("*", arg0 as HandlerOptions);
  }

  export function get(path?: string): HandlerDecorator;
  export function get(options?: HandlerOptions): HandlerDecorator;
  export function get(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("GET", arg0 as HandlerOptions);
  }

  export function post(path?: string): HandlerDecorator;
  export function post(options?: HandlerOptions): HandlerDecorator;
  export function post(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("POST", arg0 as HandlerOptions);
  }

  export function put(path?: string): HandlerDecorator;
  export function put(options?: HandlerOptions): HandlerDecorator;
  export function put(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("PUT", arg0 as HandlerOptions);
  }

  export function patch(path?: string): HandlerDecorator;
  export function patch(options?: HandlerOptions): HandlerDecorator;
  export function patch(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("PATCH", arg0 as HandlerOptions);
  }

  export function del(path: string): HandlerDecorator;
  export function del(options: HandlerOptions): HandlerDecorator;
  export function del(arg0?: string | HandlerOptions): HandlerDecorator {
    return method("DELETE", arg0 as HandlerOptions);
  }

  export function method(method: string, path?: string): HandlerDecorator;
  export function method(
    method: string,
    options?: HandlerOptions,
  ): HandlerDecorator;
  export function method(
    method: string,
    arg1?: string | HandlerOptions,
  ): HandlerDecorator {
    const { path, name } = makeOptions(arg1);
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      setHandlerMetadata(target, propertyKey, {
        method,
        path,
        name,
      });
    };
  }

  export function accepts(...types: string[]): HandlerDecorator {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      // TODO implement me
    };
  }

  export function header(name: string, value: string): HandlerDecorator {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      // TODO implement me
    };
  }

  export function cacheControl(name: string, value: string): HandlerDecorator {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      // TODO implement me
    };
  }
}

function makeOptions(
  options?: string | HandlerOptions,
): {
  readonly path: string;
  readonly name: string | null;
} {
  let path = "/";
  let name = null;
  if (typeof options == "string") {
    path = options;
  } else if (typeof options == "object" && options != null) {
    if (typeof options.path == "string") {
      path = options.path;
    }
    if (typeof options.name == "string") {
      name = options.name;
    }
  }
  if (!path.startsWith("/") || (path.length > 1 && path.endsWith("/"))) {
    throw new Error(`Invalid path '${path}'`);
  }
  return { path, name };
}

import { type Context } from "@fastr/core";
import { type PropertyKey } from "@fastr/lang";
import { addHandlerUse, setHandlerMetadata } from "../impl/metadata.js";

export interface HandlerOptions {
  readonly path?: string;
  readonly name?: string; // TODO take route name from method name?
}

export namespace http {
  export function ANY(path?: string): MethodDecorator;
  export function ANY(options?: HandlerOptions): MethodDecorator;
  export function ANY(arg0?: string | HandlerOptions): MethodDecorator {
    return method("*", arg0 as HandlerOptions);
  }

  export function GET(path?: string): MethodDecorator;
  export function GET(options?: HandlerOptions): MethodDecorator;
  export function GET(arg0?: string | HandlerOptions): MethodDecorator {
    return method("GET", arg0 as HandlerOptions);
  }

  export function POST(path?: string): MethodDecorator;
  export function POST(options?: HandlerOptions): MethodDecorator;
  export function POST(arg0?: string | HandlerOptions): MethodDecorator {
    return method("POST", arg0 as HandlerOptions);
  }

  export function PUT(path?: string): MethodDecorator;
  export function PUT(options?: HandlerOptions): MethodDecorator;
  export function PUT(arg0?: string | HandlerOptions): MethodDecorator {
    return method("PUT", arg0 as HandlerOptions);
  }

  export function PATCH(path?: string): MethodDecorator;
  export function PATCH(options?: HandlerOptions): MethodDecorator;
  export function PATCH(arg0?: string | HandlerOptions): MethodDecorator {
    return method("PATCH", arg0 as HandlerOptions);
  }

  export function DELETE(path: string): MethodDecorator;
  export function DELETE(options: HandlerOptions): MethodDecorator;
  export function DELETE(arg0?: string | HandlerOptions): MethodDecorator {
    return method("DELETE", arg0 as HandlerOptions);
  }

  export function method(method: string, path?: string): MethodDecorator;
  export function method(
    method: string,
    options?: HandlerOptions,
  ): MethodDecorator;
  export function method(
    method: string,
    arg1?: string | HandlerOptions,
  ): MethodDecorator {
    const { path, name } = makeOptions(arg1);
    return (
      target: object,
      propertyKey: PropertyKey,
      descriptor: PropertyDescriptor,
    ): void => {
      setHandlerMetadata(target, propertyKey, {
        method,
        path,
        name,
      });
    };
  }

  /**
   * Sets the given response type.
   */
  export function type(type: string): MethodDecorator {
    return (
      target: object,
      propertyKey: PropertyKey,
      descriptor: PropertyDescriptor,
    ): void => {
      addHandlerUse(target, propertyKey, (ctx, next) => {
        ctx.response.type = type;
        return next();
      });
    };
  }

  /**
   * Adds a header with the given name and value to response.
   */
  export function header(
    name: string,
    value: string | ((ctx: Context) => string),
  ): MethodDecorator {
    return (
      target: object,
      propertyKey: PropertyKey,
      descriptor: PropertyDescriptor,
    ): void => {
      if (typeof value === "function") {
        addHandlerUse(target, propertyKey, (ctx, next) => {
          ctx.response.headers.set(name, value(ctx));
          return next();
        });
      } else {
        addHandlerUse(target, propertyKey, (ctx, next) => {
          ctx.response.headers.set(name, value);
          return next();
        });
      }
    };
  }
}

function makeOptions(options?: string | HandlerOptions): {
  readonly path: string;
  readonly name: string | null;
} {
  let path = "/";
  let name = null;
  if (typeof options === "string") {
    path = options;
  } else if (options != null && typeof options === "object") {
    if (typeof options.path === "string") {
      path = options.path;
    }
    if (typeof options.name === "string") {
      name = options.name;
    }
  }
  if (!path.startsWith("/") || (path.length > 1 && path.endsWith("/"))) {
    throw new Error(`Invalid path '${path}'`);
  }
  return { path, name };
}

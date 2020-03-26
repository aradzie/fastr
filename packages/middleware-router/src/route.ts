import { type Middleware } from "@fastr/core";
import { parse } from "./parser.js";
import { makePath, type Segment } from "./path.js";
import { type RouterState } from "./types.js";

export class Route {
  /**
   * Unique route name, if any.
   */
  readonly name: string | null;
  /**
   * The path template matched by this route.
   * May contain patterns.
   */
  readonly path: string;
  /**
   * The HTTP method matched by this route.
   * Use the star character "*" for any method.
   */
  readonly method: string;
  /**
   * The list of middlewares to apply to the path.
   */
  readonly middlewares: readonly Middleware<RouterState>[];
  /**
   * Segments obtained by parsing the path.
   */
  readonly segments: readonly Segment[];

  constructor({
    name,
    path,
    method,
    middlewares,
  }: {
    readonly name: string | null;
    readonly path: string;
    readonly method: string;
    readonly middlewares: readonly Middleware<RouterState>[];
  }) {
    this.name = name;
    this.path = path;
    this.method = method.toUpperCase();
    this.middlewares = middlewares;
    this.segments = parse(path);
  }

  /**
   * Generates path by replacing parameter placeholders with the given values.
   * @param params Parameters to replace placeholders in the path.
   */
  makePath(params: { [key: string]: any }): string {
    return makePath(this.segments, params);
  }
}

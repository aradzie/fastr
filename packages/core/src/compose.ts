import { type Context } from "./context.js";
import { type BaseMiddleware, type Next } from "./middleware.js";

export type ComposedMiddleware<T extends Context> = (
  context: T,
  next?: Next,
) => Promise<void>;

export function compose<T extends Context>(
  middleware: readonly BaseMiddleware<T>[],
): ComposedMiddleware<T>;

export function compose<T extends Context>(
  middleware: readonly BaseMiddleware<T>[],
): ComposedMiddleware<T> {
  return (context: T, next?: Next): Promise<void> => {
    const dispatch = async (index: number): Promise<void> => {
      if (index < middleware.length) {
        const item = middleware[index];
        await item(
          context,
          once(() => dispatch(index + 1)),
        );
      } else if (next != null) {
        await next();
      }
    };
    return dispatch(0);
  };
}

function once(next: Next): Next {
  let called = false;
  return () => {
    if (called) {
      throw new Error("next() called multiple times");
    } else {
      called = true;
      return next();
    }
  };
}

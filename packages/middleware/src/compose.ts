import type Koa from "koa";

const kComposed = Symbol("kComposed");

export function compose<T1, U1, T2, U2>(
  middlewares: readonly [Koa.Middleware<T1, U1>, Koa.Middleware<T2, U2>],
): Koa.Middleware<T1 & T2, U1 & U2>;

export function compose<T1, U1, T2, U2, T3, U3>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
  ],
): Koa.Middleware<T1 & T2 & T3, U1 & U2 & U3>;

export function compose<T1, U1, T2, U2, T3, U3, T4, U4>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
    Koa.Middleware<T4, U4>,
  ],
): Koa.Middleware<T1 & T2 & T3 & T4, U1 & U2 & U3 & U4>;

export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
    Koa.Middleware<T4, U4>,
    Koa.Middleware<T5, U5>,
  ],
): Koa.Middleware<T1 & T2 & T3 & T4 & T5, U1 & U2 & U3 & U4 & U5>;

export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5, T6, U6>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
    Koa.Middleware<T4, U4>,
    Koa.Middleware<T5, U5>,
    Koa.Middleware<T6, U6>,
  ],
): Koa.Middleware<T1 & T2 & T3 & T4 & T5 & T6, U1 & U2 & U3 & U4 & U5 & U6>;

export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5, T6, U6, T7, U7>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
    Koa.Middleware<T4, U4>,
    Koa.Middleware<T5, U5>,
    Koa.Middleware<T6, U6>,
    Koa.Middleware<T7, U7>,
  ],
): Koa.Middleware<
  T1 & T2 & T3 & T4 & T5 & T6 & T7,
  U1 & U2 & U3 & U4 & U5 & U6 & U7
>;

export function compose<
  T1,
  U1,
  T2,
  U2,
  T3,
  U3,
  T4,
  U4,
  T5,
  U5,
  T6,
  U6,
  T7,
  U7,
  T8,
  U8
>(
  middlewares: readonly [
    Koa.Middleware<T1, U1>,
    Koa.Middleware<T2, U2>,
    Koa.Middleware<T3, U3>,
    Koa.Middleware<T4, U4>,
    Koa.Middleware<T5, U5>,
    Koa.Middleware<T6, U6>,
    Koa.Middleware<T7, U7>,
    Koa.Middleware<T8, U8>,
  ],
): Koa.Middleware<
  T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8,
  U1 & U2 & U3 & U4 & U5 & U6 & U7 & U8
>;

export function compose<T>(
  middlewares: ReadonlyArray<compose.Middleware<T>>,
): compose.ComposedMiddleware<T>;

export function compose<T>(
  middlewares: ReadonlyArray<compose.Middleware<T>>,
): compose.ComposedMiddleware<T> {
  middlewares = middlewares.flatMap((middleware) => {
    if (kComposed in middleware) {
      return (middleware as any)[kComposed] as ReadonlyArray<
        compose.Middleware<T>
      >;
    } else {
      return middleware;
    }
  });
  const composed = (context: T, next?: Koa.Next): Promise<void> => {
    const dispatch = async (index: number): Promise<void> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index];
        const nextDispatch = () => dispatch(index + 1);
        return middleware(context, once(nextDispatch));
      } else if (next != null) {
        return next();
      }
    };
    return dispatch(0);
  };
  Object.defineProperty(composed, kComposed, {
    value: middlewares,
  });
  Object.defineProperty(composed, "name", {
    value: `composed[${middlewares
      .map(({ name }) => name || "anonymous")
      .join(",")}]`,
  });
  return composed;
}

export namespace compose {
  export type Middleware<T> = (context: T, next: Koa.Next) => any;
  export type ComposedMiddleware<T> = (
    context: T,
    next?: Koa.Next,
  ) => Promise<void>;
}

export function once(next: Koa.Next): Koa.Next {
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

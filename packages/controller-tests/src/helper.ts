import { type BuildableRequest, request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { addController } from "@fastr/controller";
import { type AnyMiddleware, Application } from "@fastr/core";
import { Container } from "@fastr/invert";
import { type Newable } from "@fastr/lang";
import { Router } from "@fastr/middleware-router";

export function helper(
  container: Container | null = null,
  middleware: readonly AnyMiddleware[],
  controllers: readonly Newable[],
): BuildableRequest {
  const app = new Application(
    container ?? new Container({ autoBindInjectable: true }),
  );
  app.useAll(middleware);
  app.use(addController(new Router(), ...controllers).middleware());
  return request.use(start(app.callback()));
}

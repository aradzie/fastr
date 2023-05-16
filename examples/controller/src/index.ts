import { body, controller, http, toRoutes, use } from "@fastr/controller";
import { Application, Context } from "@fastr/core";
import { injectable } from "@fastr/invert";
import { expectJson } from "@fastr/middleware-body";
import { compress } from "@fastr/middleware-compress";
import { conditional } from "@fastr/middleware-conditional";
import { Router } from "@fastr/middleware-router";
import { createServer } from "http";

@injectable()
class Service {
  async run(): Promise<string> {
    return "Hello World!";
  }
}

@injectable()
@controller()
class Controller {
  constructor(private readonly service: Service) {}

  @http.get("/")
  async handle(ctx: Context) {
    ctx.response.body = await this.service.run();
  }

  @http.post("/")
  @use(expectJson())
  body(@body() value: unknown) {
    return `body=${JSON.stringify(value)}`;
  }
}

const router = new Router().registerAll(toRoutes(Controller));
const app = new Application();
app.use(conditional()).use(compress()).use(router.middleware());

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

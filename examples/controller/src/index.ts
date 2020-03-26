import { body, controller, http, routing, use } from "@fastr/controller";
import { Application, Context } from "@fastr/core";
import { expectJson } from "@fastr/middleware-body";
import { compress } from "@fastr/middleware-compress";
import { conditional } from "@fastr/middleware-conditional";
import { injectable } from "@sosimple/inversify";
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

const app = new Application();
app.use(conditional());
app.use(compress());
app.use(routing(app).add(Controller).middleware());

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

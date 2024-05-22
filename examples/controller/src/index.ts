import { createServer } from "node:http";
import { body, controller, http, type Pipe, toRoutes } from "@fastr/controller";
import { Application, Context } from "@fastr/core";
import { injectable } from "@fastr/invert";
import { compress } from "@fastr/middleware-compress";
import { conditional } from "@fastr/middleware-conditional";
import { Router } from "@fastr/middleware-router";
import { z, type ZodSchema } from "zod";

const check = (schema: ZodSchema): Pipe => {
  return (ctx, value) => {
    return schema.parse(value);
  };
};

const Body = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

type TBody = z.infer<typeof Body>;

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

  @http.GET("/")
  async handle(ctx: Context) {
    ctx.response.body = await this.service.run();
  }

  @http.POST("/")
  body(@body.json(check(Body), { maxLength: 0xffff }) value: TBody) {
    return `body=${JSON.stringify(value)}`;
  }
}

const router = new Router().registerAll(toRoutes(Controller));
const app = new Application();
app.use(conditional()).use(compress()).use(router.middleware());

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

import { Application } from "@fastr/core";
import { createServer } from "http";

const app = new Application();

app.use((ctx) => {
  console.log({ ...ctx.request });
  ctx.response.body = "Hello World!";
});

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

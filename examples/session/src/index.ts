import { Application } from "@fastr/core";
import { session } from "@fastr/middleware-session";
import { createServer } from "http";

const app = new Application();

app
  .use(
    session({
      store: "cookie",
      autoStart: true,
      maxAge: 3600,
    }),
  )
  .use((ctx) => {
    const count = (ctx.state.session.get("count") ?? 0) + 1;
    ctx.state.session.set("count", count);
    ctx.response.body = `I have seen you ${count} times`;
  });

createServer(app.callback()).listen(8080, () => {
  console.log("Application started on http://localhost:8080/");
});

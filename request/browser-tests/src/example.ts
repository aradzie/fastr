import { expectType, handleErrors, request } from "@webfx/browser-request";

run().catch((err) => {
  console.error(err);
});

async function run(): Promise<void> {
  const response = await request
    .post("http://localhost:3456/")
    .on("upload", (ev) => {
      console.log(ev);
    })
    .on("download", (ev) => {
      console.log(ev);
    })
    .query("a", 1)
    .query("b", 2)
    .use(expectType("text/plain"))
    .use(handleErrors())
    .sendBody("request body");
  const { status, statusText, headers } = response;
  console.log({ status, statusText, headers });
  console.log(await response.text());
}

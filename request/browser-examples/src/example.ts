import { request } from "@webfx/browser-request";

run().catch((err) => {
  console.error(err);
});

async function run(): Promise<void> {
  const response = await request
    .post("http://localhost:3456/")
    .sendBody("request body");
  const { status, statusText, headers } = response;
  console.log({ status, statusText, headers });
  console.log(await response.text());
}

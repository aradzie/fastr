import {
  type DownloadProgressEvent,
  expectType,
  request,
  type UploadProgressEvent,
} from "@fastr/fetch";

run().catch((err) => {
  console.error(err);
});

async function run(): Promise<void> {
  const response = await request
    .use(expectType("text/plain"))
    .POST("http://localhost:3456/")
    .on("upload-progress", (ev: UploadProgressEvent): void => {
      console.log(ev);
    })
    .on("download-progress", (ev: DownloadProgressEvent): void => {
      console.log(ev);
    })
    .query("a", 1)
    .query("b", 2)
    .header("x-foo", "bar")
    .send("request body");
  const { status, statusText, headers } = response;
  console.log({ status, statusText, headers });
  console.log(await response.text());
}

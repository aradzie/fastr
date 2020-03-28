import { Headers } from "@webfx-http/headers";
import {
  expectType,
  followRedirects,
  handleErrors,
  request,
  retryFailed,
} from "@webfx/node-request";

example().catch((err) => {
  console.error(err);
});

async function example(): Promise<void> {
  // TODO Use request builder.
  request
    .get("https://www.google.com/")
    .query("name", "value")
    .accept("text/html")
    .header("Accept-Encoding", "gzip")
    .header("Accept-Encoding", "br")
    .use(expectType("text/plain"))
    .use(handleErrors())
    .use(followRedirects())
    .use(retryFailed())
    .send();

  const { ok, status, statusText, headers, body } = await request({
    method: "GET",
    url: "https://www.google.com/",
    headers: Headers.builder()
      .accept("text/html")
      .append("Accept-Encoding", "gzip")
      .append("Accept-Encoding", "br")
      .build(),
  });
  console.log({
    ok,
    status,
    statusText,
    headers: headers.toJSON(),
    cookies: headers.allSetCookies(),
    body: (await body.text()).substring(0, 40) + "...",
  });
}

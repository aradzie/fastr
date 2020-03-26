import { Headers } from "@webfx-http/headers";
import { followRedirects, handleErrors, request } from "@webfx/node-request";

example().catch((err) => {
  console.error(err);
});

async function example(): Promise<void> {
  const { ok, status, statusText, headers, body } = await request({
    method: "GET",
    url: "https://www.google.com/",
    headers: Headers.builder()
      .accept("text/html")
      .append("Accept-Encoding", "gzip")
      .append("Accept-Encoding", "br")
      .build(),
    middleware: [followRedirects(), handleErrors()],
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

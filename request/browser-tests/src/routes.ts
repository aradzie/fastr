import { Body } from "@webfx-http/body";
import fs from "fs";
import { Readable } from "stream";
import util from "util";
import { index } from "./mainpage";
import { startServer } from "./server";

const readFile = util.promisify(fs.readFile);

export async function launch(): Promise<void> {
  const server = await startServer();

  // Serve the main html page.
  server.addRoute("GET", "/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(index);
  });

  // Serve the tests javascript file for the main html page.
  server.addRoute("GET", "/tests-bundle.js", async (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.end(await readFile("./build/tests-bundle.js"));
  });

  // Serve sourcemap file.
  server.addRoute("GET", "/tests-bundle.js.map", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(await readFile("./build/tests-bundle.js.map"));
  });

  // Send back the description of the received request.
  server.addRoute("*", "/test/reflect", (req, res) => {
    const { url, method } = req;
    const headers = { ...req.headers };
    delete headers["host"];
    delete headers["connection"];
    delete headers["accept-encoding"];
    delete headers["accept-language"];
    delete headers["origin"];
    delete headers["referer"];
    delete headers["user-agent"];
    const body = Body.from(req);
    body
      .text()
      .then((data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            url,
            method,
            headers,
            body: data,
          }),
        );
      })
      .catch((err) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            url,
            method,
            headers,
            error: String(err),
          }),
        );
      });
  });

  // Respond with custom status.
  server.addRoute("*", "/test/want-status", (req, res) => {
    const { url = "/" } = req;
    res.statusCode = Number(url.substring(url.indexOf("?") + 1));
    res.setHeader("Content-Type", "application/json");
    res.end('{"type":"json"}');
  });

  // Respond with status 204 No Content.
  server.addRoute("*", "/test/status/204", (req, res) => {
    res.statusCode = 204;
    res.end();
  });

  // Respond with some text.
  server.addRoute("GET", "/test/text-type", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.end("some text");
  });

  // Respond with some multipart form data.
  server.addRoute("GET", "/test/multipart-form-data-type", (req, res) => {
    res.setHeader("Content-Type", "multipart/form-data; boundary=---123");
    res.end(
      "-----123\r\n" +
        'Content-Disposition: form-data; name="a"\r\n\r\n' +
        "1\r\n" +
        "-----123\r\n" +
        'Content-Disposition: form-data; name="b"\r\n\r\n' +
        "2\r\n" +
        "-----123\r\n" +
        'Content-Disposition: form-data; name="c"\r\n\r\n' +
        "3\r\n" +
        "-----123--\r\n",
    );
  });

  // Respond with some urlencoded form data.
  server.addRoute("GET", "/test/form-urlencoded-type", (req, res) => {
    res.setHeader("Content-Type", "application/x-www-form-urlencoded");
    res.end("a=1&b=2&c=3");
  });

  // Respond with some json.
  server.addRoute("GET", "/test/json-type", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end('{"type":"json"}');
  });

  // Respond with redirection.
  server.addRoute("*", "/test/redirect", (req, res) => {
    res.statusCode = 308;
    res.setHeader("Location", `${server.url("/test/redirect-2")}`);
    res.end("Permanent Redirect");
  });

  // Respond with redirection.
  server.addRoute("*", "/test/redirect-2", (req, res) => {
    res.statusCode = 308;
    res.setHeader("Location", `${server.url("/test/redirect-3")}`);
    res.end("Permanent Redirect");
  });

  // Respond with redirection.
  server.addRoute("*", "/test/redirect-3", (req, res) => {
    res.statusCode = 308;
    res.setHeader("Location", `${server.url("/test/reflect")}`);
    res.end("Permanent Redirect");
  });

  // Respond slowly.
  server.addRoute("GET", "/test/slow-response", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.flushHeaders();
    setTimeout(() => {
      res.write("data\n");
      setTimeout(() => {
        res.write("more data\n");
        setTimeout(() => {
          res.end("done");
        }, 1000);
      }, 1000);
    }, 1000);
  });

  // Respond with infinite data stream.
  server.addRoute("GET", "/test/infinite-response", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.flushHeaders();
    let count = 1;
    const infinite = new Readable({
      read(): void {
        this.push(`packet${(count += 1)}\n`);
      },
    });
    infinite.pipe(res);
  });

  // Destroy request stream prematurely.
  server.addRoute("GET", "/test/abort-request", (req, res) => {
    res.flushHeaders();
    res.write("data");
    req.destroy();
  });

  // Destroy response stream prematurely.
  server.addRoute("GET", "/test/abort-response", (req, res) => {
    res.flushHeaders();
    res.write("data");
    res.destroy();
  });

  // Send unknown content-encoding.
  server.addRoute("GET", "/test/unknown-content-encoding", (req, res) => {
    res.setHeader("Content-Encoding", "omg");
    res.write("what is this\n");
    res.write("what is this\n");
    res.write("what is this\n");
    res.destroy();
  });

  // Send invalid content-encoding.
  server.addRoute("GET", "/test/invalid-content-encoding", (req, res) => {
    res.setHeader("Content-Encoding", "gzip");
    res.write("invalid gzip data\n");
    res.write("invalid gzip data\n");
    res.write("invalid gzip data\n");
    res.destroy();
  });
}

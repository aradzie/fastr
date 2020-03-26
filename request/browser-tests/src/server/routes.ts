import fs from "fs";
import util from "util";
import { index } from "./mainpage";
import { startServer } from "./server";

const readFile = util.promisify(fs.readFile);

export async function launch(): Promise<void> {
  const server = await startServer();

  server.addRoute("GET", "/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(index);
  });
  server.addRoute("GET", "/tests-bundle.js", async (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.end(await readFile("./build/tests-bundle.js"));
  });
  server.addRoute("GET", "/response/text", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.end("some text");
  });
  server.addRoute("GET", "/response/json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ type: "json" }));
  });
}

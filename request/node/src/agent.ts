import http from "http";
import https from "https";

export type AnyAgent = http.Agent | https.Agent | boolean;

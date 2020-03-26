import { request } from "@webfx/browser-request";
import { expect } from "chai";

describe("Request", () => {
  it("get text", async () => {
    const response = await request.get("/response/text");
    const { status, statusText, headers } = response;
    expect(status).to.eq(200);
    expect(statusText).to.eq("OK");
    expect(headers.contentType()?.name).to.eq("text/plain");
    expect(await response.text()).to.eq("some text");
  });

  it("get json", async () => {
    const response = await request.get("/response/json");
    const { status, statusText, headers } = response;
    expect(status).to.eq(200);
    expect(statusText).to.eq("OK");
    expect(headers.contentType()?.name).to.eq("application/json");
    expect(await response.json()).to.deep.eq({ type: "json" });
  });
});

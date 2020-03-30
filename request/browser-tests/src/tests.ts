import {
  Adapter,
  adapter,
  fetchAdapter,
  request,
  xhrAdapter,
} from "@webfx/browser-request";
import { expect } from "chai";
import { formDataEntries, parseFormData } from "./util";

mocha.setup({
  ui: "bdd",
});
makeTests(xhrAdapter);
makeTests(fetchAdapter);
mocha.run();

function makeTests(underTest: Adapter): void {
  describe(`Adapter [${underTest.name}]`, () => {
    beforeEach(() => {
      adapter(underTest);
    });

    it("data url", async () => {
      const response = await request
        .get("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==")
        .send();
      expect(await response.text()).to.eq("Hello, World!");
    });

    it("get with client error status", async () => {
      const response = await request.get("/test/want-status?400").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(400);
      expect(statusText).to.eq("Bad Request");
      expect(headers.contentType()?.name).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("get with server error status", async () => {
      const response = await request.get("/test/want-status?500").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(500);
      expect(statusText).to.eq("Internal Server Error");
      expect(headers.contentType()?.name).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("get no content", async () => {
      const response = await request.get("/test/status/204").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(204);
      expect(statusText).to.eq("No Content");
      expect(headers.contentType()).to.eq(null);
      expect(await response.text()).to.eq("");
    });

    it("get body as blob", async () => {
      const response = await request.get("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq("text/plain");
      const body = await response.blob();
      expect(body).to.instanceof(Blob);
      expect(body.type).to.eq("text/plain");
      expect(body.size).to.eq(9);
      expect(await body.text()).to.eq("some text");
    });

    it("get body as array buffer", async () => {
      const response = await request.get("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq("text/plain");
      const body = await response.arrayBuffer();
      expect(body).to.instanceof(ArrayBuffer);
      expect(body.byteLength).to.eq(9);
      expect(String.fromCharCode(...new Uint8Array(body))).to.eq("some text");
    });

    it("get body as text", async () => {
      const response = await request.get("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq("text/plain");
      expect(await response.text()).to.eq("some text");
    });

    it("get body as multipart form data", async () => {
      const response = await request
        .get("/test/multipart-form-data-type")
        .send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq("multipart/form-data");
      if (underTest === xhrAdapter) {
        // The XHR adapter cannot read multipart form data.
        try {
          await response.formData();
        } catch (ex) {
          expect(ex.message).to.eq(
            process.env.NODE_ENV !== "production"
              ? "Implement your own 'multipart/form-data' parser."
              : undefined,
          );
          return;
        }
        expect.fail("Should throw error");
      } else {
        // The fetch adapter will read form data.
        expect(formDataEntries(await response.formData())).to.deep.eq([
          ["a", "1"],
          ["b", "2"],
          ["c", "3"],
        ]);
      }
    });

    it("get body as urlencoded form data", async () => {
      const response = await request.get("/test/form-urlencoded-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq(
        "application/x-www-form-urlencoded",
      );
      expect(formDataEntries(await response.formData())).to.deep.eq([
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ]);
    });

    it("get body as json", async () => {
      const response = await request.get("/test/json-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.contentType()?.name).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("send a get request with empty body", async () => {
      const response = await request
        .get("/test/reflect")
        .accept("image/png")
        .accept("image/*")
        .header("X-Foo", "Bar")
        .send();
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "GET",
        headers: {
          "accept": "image/png, image/*",
          "x-foo": "Bar",
        },
        body: "",
      });
    });

    it("send a post request with a string body", async () => {
      const response = await request
        .post("/test/reflect")
        .header("X-Foo", "Bar")
        .sendBody("text data");
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "text/plain",
          "content-length": "9",
          "x-foo": "Bar",
        },
        body: "text data",
      });
    });

    it("send a post request with a blob body", async () => {
      const response = await request
        .post("/test/reflect")
        .header("X-Foo", "Bar")
        .sendBody(new Blob(["blob data"]));
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/octet-stream",
          "content-length": "9",
          "x-foo": "Bar",
        },
        body: "blob data",
      });
    });

    it("send a post request with a multipart form data body", async () => {
      const formData = new FormData();
      formData.append("a", "1");
      formData.append("b", "2");
      formData.append("c", "3");
      const response = await request
        .post("/test/reflect")
        .header("X-Foo", "Bar")
        .sendForm(formData);
      const { body, ...val } = await response.json();
      const parsedFormData = parseFormData(body);
      expect(val).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "multipart/form-data",
          "content-length": String(body.length),
          "x-foo": "Bar",
        },
      });
      expect(formDataEntries(parsedFormData)).to.deep.eq([
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ]);
    });

    it("send a post request with an urlencoded form data body", async () => {
      const response = await request
        .post("/test/reflect")
        .header("X-Foo", "Bar")
        .sendForm(
          new URLSearchParams([
            ["a", "1"],
            ["b", "2"],
            ["c", "3"],
          ]),
        );
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/x-www-form-urlencoded",
          "content-length": "11",
          "x-foo": "Bar",
        },
        body: "a=1&b=2&c=3",
      });
    });

    it("send a post request with a JSON data body", async () => {
      const response = await request
        .post("/test/reflect")
        .header("X-Foo", "Bar")
        .sendJson({ a: 1, b: 2, c: 3 });
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/json",
          "content-length": "19",
          "x-foo": "Bar",
        },
        body: '{"a":1,"b":2,"c":3}',
      });
    });

    it("follow redirects", async () => {
      const response = await request.post("/test/redirect").sendBody("posted");
      expect(await response.json()).to.deep.eq({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "text/plain",
          "content-length": "6",
        },
        body: "posted",
      });
    });

    it("read body twice", async () => {
      const response = await request.get("/test/text-type").send();
      const { status, statusText } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(await response.text()).to.eq("some text");
      try {
        await response.blob();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("ignore body", async () => {
      // TODO In Chrome dev tools:
      //   Uncaught (in promise) RequestAbortedError: Request aborted
      const response = await request.get("/test/infinite-response").send();
      response.abort();
      try {
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(DOMException);
        expect(ex.code).to.eq(DOMException.ABORT_ERR);
        return;
      }
      expect.fail("Should throw error");
    });

    it("ignore body asynchronously", async () => {
      const response = await request.get("/test/infinite-response").send();
      setTimeout(() => {
        response.abort();
      }, 10);
      try {
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(DOMException);
        expect(ex.code).to.eq(DOMException.ABORT_ERR);
        return;
      }
      expect.fail("Should throw error");
    });

    it("request aborted on the server", async () => {
      try {
        const response = await request.get("/test/abort-request").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("response aborted on the server", async () => {
      try {
        const response = await request.get("/test/abort-response").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("destination unreachable", async () => {
      try {
        const response = await request.get("http://localhost:1/").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("unknown content encoding", async () => {
      try {
        await request.get("/test/unknown-content-encoding").send();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("invalid content encoding", async () => {
      try {
        await request.get("/test/invalid-content-encoding").send();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
    });
  });
}

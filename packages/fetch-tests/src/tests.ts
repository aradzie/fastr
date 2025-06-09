import {
  type Adapter,
  fetchAdapter,
  request,
  useAdapter,
  xhrAdapter,
} from "@fastr/fetch";
import { ContentType } from "@fastr/headers";
import { mergeSearchParams } from "@fastr/url";
import { expect, use } from "chai";
import chaiLike from "chai-like";
import { formDataEntries, parseFormData } from "./util.js";

use(chaiLike);
mocha.setup({
  ui: "bdd",
});
makeMiscTests();
makeAdapterTests(xhrAdapter);
makeAdapterTests(fetchAdapter);
mocha.run();

function makeMiscTests(): void {
  describe("URL", () => {
    it("convert URLSearchParams to string", () => {
      expect(
        String(
          new URLSearchParams([
            ["a", "1"],
            ["b", "2"],
          ]),
        ),
      ).to.eq("a=1&b=2");
    });

    it("merge search params", () => {
      expect(mergeSearchParams("/?a=1", new URLSearchParams("b=2"))).to.eq(
        "/?a=1&b=2",
      );
    });
  });
}

function makeAdapterTests(underTest: Adapter): void {
  describe(`Adapter [${underTest.name}]`, () => {
    beforeEach(() => {
      useAdapter(underTest);
    });

    it("get data url", async () => {
      const response = await request
        .GET("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==")
        .send();
      expect(await response.text()).to.eq("Hello, World!");
    });

    it("get blob url", async () => {
      const blob = new Blob(["blob data"], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const response = await request.GET(url).send();
      expect(await response.text()).to.eq("blob data");
    });

    it("get with client error status", async () => {
      const response = await request.GET("/test/want-status?400").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(400);
      expect(statusText).to.eq("Bad Request");
      expect(ContentType.get(headers)?.type.essence).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("get with server error status", async () => {
      const response = await request.GET("/test/want-status?500").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(500);
      expect(statusText).to.eq("Internal Server Error");
      expect(ContentType.get(headers)?.type.essence).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("get no content", async () => {
      const response = await request.GET("/test/status/204").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(204);
      expect(statusText).to.eq("No Content");
      expect(ContentType.get(headers)).to.eq(null);
      expect(await response.text()).to.eq("");
    });

    it("get body as blob", async () => {
      const response = await request.GET("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.get("Content-Type")).to.eq("text/plain");
      const body = await response.blob();
      expect(body).to.instanceof(Blob);
      expect(body.type).to.eq("text/plain");
      expect(body.size).to.eq(9);
      expect(await body.text()).to.eq("some text");
    });

    it("get body as array buffer", async () => {
      const response = await request.GET("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.get("Content-Type")).to.eq("text/plain");
      const body = await response.arrayBuffer();
      expect(body).to.instanceof(ArrayBuffer);
      expect(body.byteLength).to.eq(9);
      expect(String.fromCharCode(...new Uint8Array(body))).to.eq("some text");
    });

    it("get body as text", async () => {
      const response = await request.GET("/test/text-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(headers.get("Content-Type")).to.eq("text/plain");
      expect(await response.text()).to.eq("some text");
    });

    it("get body as multipart form data", async () => {
      const response = await request
        .GET("/test/multipart-form-data-type")
        .send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(ContentType.get(headers)?.type.essence).to.eq(
        "multipart/form-data",
      );
      if (underTest === xhrAdapter) {
        // The XHR adapter cannot read multipart form data.
        try {
          await response.formData();
        } catch (ex: any) {
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
      const response = await request.GET("/test/form-urlencoded-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(ContentType.get(headers)?.type.essence).to.eq(
        "application/x-www-form-urlencoded",
      );
      expect(formDataEntries(await response.formData())).to.deep.eq([
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ]);
    });

    it("get body as json", async () => {
      const response = await request.GET("/test/json-type").send();
      const { status, statusText, headers } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(ContentType.get(headers)?.type.essence).to.eq("application/json");
      expect(await response.json()).to.deep.eq({ type: "json" });
    });

    it("send a get request with empty body", async () => {
      const response = await request
        .GET("/test/reflect")
        .accept("image/png")
        .accept("image/*")
        .header("X-Foo", "bar")
        .send();
      expect(await response.json()).like({
        url: "/test/reflect",
        method: "GET",
        headers: {
          "accept": "image/png, image/*",
          "x-foo": "bar",
        },
        body: "",
      });
    });

    it("send a post request with a string body", async () => {
      const response = await request
        .POST("/test/reflect")
        .header("X-Foo", "bar")
        .send("text data");
      expect(await response.json()).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "text/plain;charset=UTF-8",
          "content-length": "9",
          "x-foo": "bar",
        },
        body: "text data",
      });
    });

    it("send a post request with a blob body", async () => {
      const response = await request
        .POST("/test/reflect")
        .header("X-Foo", "bar")
        .send(new Blob(["blob data"]));
      expect(await response.json()).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/octet-stream",
          "content-length": "9",
          "x-foo": "bar",
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
        .POST("/test/reflect")
        .header("X-Foo", "bar")
        .sendForm(formData);
      const { body, ...val } = await response.json<any>();
      expect(val.headers["content-type"]).to.match(
        /^multipart\/form-data; *boundary=.*$/,
      );
      expect(val).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-length": String(body.length),
          "x-foo": "bar",
        },
      });
      expect(formDataEntries(parseFormData(body))).to.deep.eq([
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ]);
    });

    it("send a post request with an urlencoded form data body", async () => {
      const response = await request
        .POST("/test/reflect")
        .header("X-Foo", "bar")
        .sendForm(
          new URLSearchParams([
            ["a", "1"],
            ["b", "2"],
            ["c", "3"],
          ]),
        );
      const { body, ...val } = await response.json<any>();
      expect(val.headers["content-type"]).to.match(
        /^application\/x-www-form-urlencoded; *charset=UTF-8$/,
      );
      expect(val).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-length": "11",
          "x-foo": "bar",
        },
      });
      expect(body).to.eq("a=1&b=2&c=3");
    });

    it("send a post request with a JSON data body", async () => {
      const response = await request
        .POST("/test/reflect")
        .header("X-Foo", "bar")
        .send({ a: 1, b: 2, c: 3 });
      expect(await response.json()).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "application/json",
          "content-length": "19",
          "x-foo": "bar",
        },
        body: '{"a":1,"b":2,"c":3}',
      });
    });

    it("follow redirects", async () => {
      const response = await request.POST("/test/redirect").send("posted");
      expect(await response.json()).like({
        url: "/test/reflect",
        method: "POST",
        headers: {
          "accept": "*/*",
          "content-type": "text/plain;charset=UTF-8",
          "content-length": "6",
        },
        body: "posted",
      });
    });

    it("read body twice", async () => {
      const response = await request.GET("/test/text-type").send();
      const { status, statusText } = response;
      expect(status).to.eq(200);
      expect(statusText).to.eq("OK");
      expect(response.bodyUsed).to.eq(false);
      expect(await response.text()).to.eq("some text");
      expect(response.bodyUsed).to.eq(true);
      try {
        await response.blob();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("abort synchronously", async () => {
      const controller = new AbortController();
      const response = await request
        .GET("/test/infinite-response")
        .signal(controller.signal)
        .send();
      controller.abort();
      try {
        await response.text();
      } catch (ex: any) {
        expect(ex).to.instanceof(DOMException);
        expect(ex.code).to.eq(DOMException.ABORT_ERR);
        return;
      }
      expect.fail("Should throw error");
    });

    it("abort asynchronously", async () => {
      const controller = new AbortController();
      const response = await request
        .GET("/test/infinite-response")
        .signal(controller.signal)
        .send();
      setTimeout(() => {
        controller.abort();
      }, 10);
      try {
        await response.text();
      } catch (ex: any) {
        expect(ex).to.instanceof(DOMException);
        expect(ex.code).to.eq(DOMException.ABORT_ERR);
        return;
      }
      expect.fail("Should throw error");
    });

    it("abort before request", async () => {
      const controller = new AbortController();
      controller.abort();
      try {
        await request
          .GET("/test/infinite-response")
          .signal(controller.signal)
          .send();
      } catch (ex: any) {
        expect(ex).to.instanceof(DOMException);
        expect(ex.code).to.eq(DOMException.ABORT_ERR);
        return;
      }
      expect.fail("Should throw error");
    });

    it("abort after response", async () => {
      const controller = new AbortController();
      const response = await request
        .GET("/test/text-type")
        .signal(controller.signal)
        .send();
      expect(await response.text()).to.eq("some text");
      controller.abort();
      expect(response.status).to.eq(200);
      expect(response.statusText).to.eq("OK");
    });

    it("request aborted on the server", async () => {
      try {
        const response = await request.GET("/test/abort-request").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("response aborted on the server", async () => {
      try {
        const response = await request.GET("/test/abort-response").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("destination unreachable", async () => {
      try {
        const response = await request.GET("http://localhost:12345/").send();
        await response.text();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("unknown content encoding", async () => {
      try {
        await request.GET("/test/unknown-content-encoding").send();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
      expect.fail("Should throw error");
    });

    it("invalid content encoding", async () => {
      try {
        await request.GET("/test/invalid-content-encoding").send();
      } catch (ex) {
        expect(ex).to.instanceof(TypeError);
        return;
      }
    });
  });
}

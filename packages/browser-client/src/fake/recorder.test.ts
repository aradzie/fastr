import test from "ava";
import { Recorder } from "./recorder.js";
import { FakeHttpResponse } from "./response.js";

test("successful response", async (t) => {
  const recorder = new Recorder();
  const adapter = recorder.record(FakeHttpResponse.withBody("ok"));

  setTimeout(() => {
    adapter({ method: "GET", url: "/" }).catch(() => {
      /* Failure is not expected. */
    });
  }, 1);

  t.is(recorder.state, "not called");
  t.is(recorder.request, null);
  t.is(recorder.response, null);

  await recorder.waiter;

  t.is(recorder.state, "ended");
  t.is(recorder.request?.method, "GET");
  t.is(recorder.request?.url, "/");
  t.is(recorder.response?.url, "/");
  t.is(recorder.response?.status, 200);
  t.is(recorder.response?.statusText, "OK");
  t.is(recorder.error, null);
});

test("failing response", async (t) => {
  const error = new Error("omg");
  const recorder = new Recorder();
  const adapter = recorder.record(FakeHttpResponse.throwError(error));

  setTimeout(() => {
    adapter({ method: "GET", url: "/" }).catch(() => {
      /* Ignore expected failure. */
    });
  }, 1);

  t.is(recorder.state, "not called");
  t.is(recorder.request, null);
  t.is(recorder.response, null);
  t.is(recorder.error, null);

  await recorder.waiter;

  t.is(recorder.state, "failed");
  t.is(recorder.request?.method, "GET");
  t.is(recorder.request?.url, "/");
  t.is(recorder.response, null);
  t.is(recorder.error, error);
});

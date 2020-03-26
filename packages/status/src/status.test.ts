import test from "ava";
import {
  isClientError,
  isRedirect,
  isServerError,
  isStatus,
  isSuccess,
} from "./status.js";

test("check status", (t) => {
  t.false(isStatus(1));
  t.false(isStatus(400.1));
  t.true(isStatus(400));
});

test("check success", (t) => {
  t.false(isSuccess(199));
  t.true(isSuccess(200));
  t.true(isSuccess(299));
  t.false(isSuccess(300));
});

test("check redirect", (t) => {
  t.false(isRedirect(299));
  t.true(isRedirect(300));
  t.true(isRedirect(399));
  t.false(isRedirect(304));
  t.false(isRedirect(400));
});

test("check client error", (t) => {
  t.false(isClientError(399));
  t.true(isClientError(400));
  t.true(isClientError(499));
  t.false(isClientError(500));
});

test("check server error", (t) => {
  t.false(isServerError(499));
  t.true(isServerError(500));
  t.true(isServerError(599));
  t.false(isServerError(600));
});

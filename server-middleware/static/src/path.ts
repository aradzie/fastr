import { BadRequestError, ForbiddenError } from "@webfx-http/error";

export function normalizeUriPath(path: string): string {
  try {
    path = decodeURIComponent(path);
  } catch {
    throw new BadRequestError();
  }
  if (!path.startsWith("/")) {
    throw new BadRequestError();
  }
  if (path == "/") {
    return path;
  }
  const { length } = path;
  const stack = [];
  let pos = 1;
  while (pos < length) {
    let i = path.indexOf("/", pos);
    let segment;
    let dir;
    if (i != -1) {
      segment = path.substring(pos, i);
      pos = i + 1;
      dir = true;
    } else {
      segment = path.substring(pos);
      pos = length;
      dir = false;
    }
    if (segment == "" || segment == ".") {
      // Empty segment.
      continue;
    }
    if (segment == "..") {
      // Parent segment.
      if (stack.length > 0) {
        stack.pop();
      } else {
        throw new ForbiddenError();
      }
      continue;
    }
    if (dir) {
      segment += "/";
    }
    stack.push(segment);
  }
  return "/" + stack.join("");
}

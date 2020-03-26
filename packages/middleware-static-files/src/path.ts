import { BadRequestError } from "@fastr/errors";

export function normalizeUriPath(path: string): string {
  // This function assumes that node has already normalized the given path,
  // which means that sequences such as "//", "/./" and "/../" were replaced.

  if (path.indexOf("%2F") !== -1) {
    // Error if the path contains percent encoded slashes.
    throw new BadRequestError(`Invalid path "${path}"`);
  }

  let decoded;

  try {
    decoded = decodeURIComponent(path);
  } catch {
    // Error if the path cannot be percent decoded.
    throw new BadRequestError(`Invalid path "${path}"`);
  }

  // Percent decoding can introduce dots and slashes.
  // Check if the decoded path is safe.

  if (
    decoded.indexOf("/../") !== -1 ||
    decoded.startsWith("../") ||
    decoded.endsWith("/..")
  ) {
    // Error if the decoded path contains relative segments.
    throw new BadRequestError(`Invalid path "${path}"`);
  }

  return decoded;
}

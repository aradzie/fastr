import { MediaType } from "@fastr/headers";
import data, { type MimeDbItemMap } from "mime-db";

export type MediaTypeInfo = {
  /** Canonical type name. */
  readonly type: string;
  /** The list of file extensions. */
  readonly ext: readonly string[];
  /** Whether this is a text type and requires the charset param. */
  readonly text: boolean;
  /** Whether this is type is compressible. */
  readonly compressible: boolean;
};

const byType = new Map<string, MediaTypeInfo>();
const byExt = new Map<string, MediaTypeInfo>();

/**
 * Parsed mime type components.
 */
export class MediaTypes {
  static register(info: MediaTypeInfo): void {
    byType.set(info.type, info);
    for (const ext of info.ext) {
      byExt.set(ext, info);
    }
  }

  static lookup(type: MediaType | string): MediaTypeInfo | null {
    return byType.get(MediaType.from(type).essence) ?? null;
  }

  static lookupByExt(ext: string): MediaTypeInfo | null {
    if (ext.startsWith(".")) {
      ext = ext.substring(1);
    }
    return byExt.get(ext.toLowerCase()) ?? null;
  }
}

/**
 * A heuristic to quickly test whether the given type is likely text.
 */
function isLikelyTextType(type: string): boolean {
  return (
    type.startsWith("text/") ||
    type.endsWith("/text") ||
    type.endsWith("+text") ||
    type.endsWith("/xml") ||
    type.endsWith("+xml") ||
    type.endsWith("/json") ||
    type.endsWith("+json")
  );
}

function init(data: MimeDbItemMap): void {
  const emptyExt = Object.freeze<string[]>([]);
  for (const [type, details] of Object.entries(data)) {
    MediaTypes.register({
      type,
      ext: details.extensions ?? emptyExt,
      text: details.charset === "UTF-8" || isLikelyTextType(type),
      compressible: details.compressible === true,
    });
  }
}

init(data);

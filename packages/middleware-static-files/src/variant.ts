import { type Context } from "@fastr/core";
import { MediaTypes } from "@fastr/mediatypes";
import { stat, type Stats } from "@sosimple/fsx";
import { Encoding } from "./encoding.js";

export interface Variant {
  /**
   * Identity file type.
   */
  readonly type: string;
  /**
   * Identity file path.
   */
  readonly path: string;
  /**
   * Identity file stats.
   */
  readonly stats: Stats;
  /**
   * Selected variant encoding. Can be just `identity`.
   *
   * From all available encodings (e.g. `gzip`, `br`) we select the one
   * with the smallest file size.
   */
  readonly variantEncoding: Encoding;
  /**
   * Selected variant file path. In case of identity encoding the same as `path`.
   */
  readonly variantPath: string;
  /**
   * Selected variant file stats. In case of identity encoding the same as `stats`.
   */
  readonly variantStats: Stats;
}

/**
 * Selects the variant to serve.
 *
 * From all available encodings (e.g. `gzip`, `br`) will select the one with the smallest file size.
 *
 * If no variants are available we return the original file with encoding set to `identity`.
 */
export async function findVariant(
  ctx: Context,
  path: string,
): Promise<Variant | null> {
  const stats = await tryStat(path);
  if (stats == null) {
    return null;
  }
  let variantEncoding = Encoding.identity;
  let variantPath = path;
  let variantStats = stats;
  for (const candidateEncoding of Encoding.encodings) {
    if (candidateEncoding.isAccepted(ctx.request)) {
      const candidatePath = path + candidateEncoding.ext;
      const candidateStats = await tryStat(candidatePath);
      if (candidateStats != null && candidateStats.size < variantStats.size) {
        variantEncoding = candidateEncoding;
        variantPath = candidatePath;
        variantStats = candidateStats;
      }
    }
  }
  return {
    type: getType(path),
    path,
    stats,
    variantEncoding,
    variantPath,
    variantStats,
  };
}

async function tryStat(path: string): Promise<Stats | null> {
  try {
    const stats = await stat(path);
    if (stats.isFile() && stats) {
      return stats;
    }
  } catch {
    // Ignore.
  }
  return null;
}

function getType(path: string): string {
  let type: string | null = null;
  const i = path.lastIndexOf(".");
  if (i !== -1) {
    type = MediaTypes.lookupByExt(path.substring(i + 1))?.type ?? null;
  }
  return type ?? "application/octet-stream";
}

/**
 * An item with weight, such as `"gzip; q=0.1"`.
 */
export type Weighted = {
  q: number;
};

/**
 * Provides basic operations for the inherited classes.
 */
export abstract class Accepted<T> implements Weighted {
  private _q = 1;

  get q(): number {
    return this._q;
  }

  set q(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new TypeError(`Invalid q value ${value}`);
    }
    this._q = Math.round(value * 1000) / 1000;
  }

  abstract compare(candidate: T): number | null;
}

export const negotiateAll = <T>(
  candidates: readonly string[],
  accepted: Accepted<T>[],
  transform: (value: string) => T,
): string[] => {
  const findMostSpecific = (candidate: T) => {
    let ms = -1;
    let mq = -1;
    let mi = -1;
    let i = 0;
    for (const item of accepted) {
      const s = item.compare(candidate);
      const { q } = item;
      if (s != null && s > ms) {
        ms = s;
        mq = q;
        mi = i;
      }
      i += 1;
    }
    return { s: ms, q: mq, i: mi };
  };

  const list = [];
  for (const candidate of candidates) {
    const { s, q, i } = findMostSpecific(transform(candidate));
    if (q > 0) {
      list.push({ s, q, i, candidate });
    }
  }
  return list
    .sort((a, b) => b.s - a.s || b.q - a.q || a.i - b.i)
    .map(({ candidate }) => candidate);
};

export const head = <T>(list: readonly T[]): T | null => {
  if (list.length > 0) {
    return list[0];
  } else {
    return null;
  }
};

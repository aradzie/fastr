export function mergeSearchParams(
  url: string,
  params: URLSearchParams,
): string {
  const entries = [...params];
  if (entries.length === 0) {
    return url;
  }
  let base;
  let q;
  const i = url.indexOf("?");
  if (i !== -1) {
    base = url.substring(0, i);
    q = new URLSearchParams(url.substring(i + 1));
  } else {
    base = url;
    q = new URLSearchParams();
  }
  for (const [name, value] of entries) {
    q.append(name, value);
  }
  return `${base}?${q}`;
}

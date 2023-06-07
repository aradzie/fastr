export function parseDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  } else {
    return date;
  }
}

export function stringifyDate(date: Date): string {
  return date.toUTCString();
}

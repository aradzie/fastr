/**
 * A simplistic and naive form data parser which is only suitable for tests.
 */
export function parseFormData(input: string): FormData {
  const formData = new FormData();
  const regExp = /^Content-Disposition:\s+form-data;\s+name="([^"]*)"$/i;
  let state = false;
  let name = "";
  for (const line of input.split("\r\n")) {
    if (line === "") {
      continue;
    }
    if (!state) {
      const m = regExp.exec(line);
      if (m != null) {
        name = m[1];
        state = true;
      }
    } else {
      formData.append(name, line);
      state = false;
    }
  }
  return formData;
}

export function formDataEntries(formData: FormData): string[][] {
  const entries: string[][] = [];
  formData.forEach((value, name) => {
    entries.push([name, String(value)]);
  });
  return entries;
}

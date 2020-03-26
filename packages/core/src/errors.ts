export interface ErrorDetails {
  readonly name: string;
  readonly message: string;
  readonly status: number;
  readonly expose: boolean;
}

export function inspectError(err: any): ErrorDetails {
  let name = "Error";
  let message = "";
  let status = 500;
  let expose = false;
  if (err != null && typeof err === "object") {
    if (typeof err.name === "string") {
      name = err.name;
    }
    if (typeof err.message === "string") {
      message = err.message;
    }
    if (typeof err.status === "number") {
      status = err.status;
    } else if (typeof err.statusCode === "number") {
      status = err.statusCode;
    }
    if (typeof err.expose === "boolean") {
      expose = err.expose;
    }
  } else {
    message = String(err);
  }
  return { name, message, status, expose };
}

export type Type<T> = { new (...args: any[]): T };

// TODO Combine @context and @inject, enable handler parameter injection.
export const kApp = Symbol("App");
export const kContext = Symbol("Context");
export const kRequest = Symbol("Request");
export const kResponse = Symbol("Response");
export const kRouter = Symbol("Router");

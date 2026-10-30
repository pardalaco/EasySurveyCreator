export class HttpError extends Error {
  code?: number;

  constructor(message: string, code: number = 400) {
    super(message);
    this.name = "HttpError";
    this.code = code;
  }
}

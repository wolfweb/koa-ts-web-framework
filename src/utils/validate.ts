export class ValidateError extends Error {
  constructor(message: string) {
      super(message);
      this.name = "ValidateError";
  }
}
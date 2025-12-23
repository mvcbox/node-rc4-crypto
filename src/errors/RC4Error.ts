export class RC4Error extends Error {
  public constructor(message?: string) {
    super(message);
    this.name = new.target.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

interface WonStdErrorProps {
  code: string;
  message?: string;
  cause?: Error;
}

export class WonStdError extends Error {
  public readonly code: string;
  public readonly cause?: Error;

  constructor({ code, message, cause }: WonStdErrorProps) {
    super(message);

    this.code = code;
    this.cause = cause;
  }
}

import { WonStdError } from 'src/errors/won-std-error';

enum Code {
  ERROR_ALREADY_INITIALIZED = 'ERROR_ALREADY_INITIALIZED',
  ERROR_INCORRECT_CONFIG = 'ERROR_INCORRECT_CONFIG',
  ERROR_CANNOT_DOWNLOAD_CONFIG = 'ERROR_CANNOT_DOWNLOAD_CONFIG',
  ERROR_CONFIG_POLLING_ALREADY_STARTED = 'ERROR_CONFIG_POLLING_ALREADY_STARTED',
}

export class FeatureReleaseError extends WonStdError {
  static Code = Code;

  constructor(code: Code, message?: string) {
    super({
      code,
      message: {
        [Code.ERROR_ALREADY_INITIALIZED]:
          message ??
          'FeatureRelease is already initialized. FeatureRelease should be a singleton.',
        [Code.ERROR_INCORRECT_CONFIG]:
          message ?? 'The config is incorrectly formatted.',
        [Code.ERROR_CANNOT_DOWNLOAD_CONFIG]:
          message ?? 'Failed to download the feature release config.',
        [Code.ERROR_CONFIG_POLLING_ALREADY_STARTED]:
          message ?? 'Config polling has already started.',
      }[code],
    });
  }
}

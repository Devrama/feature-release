let isDebugMode = false;

export function setDebugMode(isEnabled: boolean): void {
  isDebugMode = isEnabled;
}

export function printLog(
  level: 'debug' | 'info' | 'warn' | 'error',
  ...arg: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): void {
  isDebugMode && console[level](arg);
}

import { faker } from '@faker-js/faker';
import crypto from 'crypto';

export function delay(timeInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}

export function generateEnabledTargetKeyWithPercentage(
  featureFlagName: string,
  targetPercentage: number,
  namespace?: string
): string {
  while (true) {
    const potentialKey = faker.random.alphaNumeric(5);
    const salt = `${featureFlagName}.${namespace ?? ''}`; // Different result by percentage when a same key is used in different namespaces and feature flags.
    const hash = crypto
      .createHash('md5')
      .update(`${salt}.${potentialKey}`)
      .digest('hex');
    const num4Bytes = parseInt(hash.substring(0, 8), 16);
    const remain = num4Bytes % 100; // Between 0(inclusive) and 99(inclusive).
    if (remain === targetPercentage) {
      return potentialKey;
    }
  }
}

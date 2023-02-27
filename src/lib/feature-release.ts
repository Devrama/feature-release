import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { FeatureReleaseError } from 'src/errors/feature-release-error';
import { printLog } from 'src/helpers/logger';
import {
  FeatureReleaseConfig,
  FeatureReleaseOptions,
  NamespacedRule,
  Rule,
} from 'src/types';
import { featureReleaseConfigSchema } from 'src/types-zod';
import { ZodError } from 'zod';

export class FeatureRelease {
  private featureReleaseConfig: FeatureReleaseConfig;
  private readonly options?: Required<FeatureReleaseOptions>;
  private timer?: NodeJS.Timer;

  constructor(
    featureReleaseConfig: FeatureReleaseConfig,
    options?: FeatureReleaseOptions
  ) {
    FeatureRelease.validateConfig(featureReleaseConfig);

    this.featureReleaseConfig = featureReleaseConfig;
    this.options = options && {
      ...options,
      enableConfigPolling: options.enableConfigPolling ?? false,
      pollingIntervalInSeconds: options.pollingIntervalInSeconds ?? 60,
    };

    if (this.options?.enableConfigPolling && this.options?.hostedConfigUrl) {
      this.startPollingConfig();
    }
  }

  public static async downloadHostedFeatureReleaseConfig(
    hostedConfigUrl: string
  ): Promise<FeatureReleaseConfig> {
    try {
      const response = await axios.get<FeatureReleaseConfig>(hostedConfigUrl);
      printLog('info', response.status, response.data);
      FeatureRelease.validateConfig(response.data);

      return response.data as FeatureReleaseConfig;
    } catch (err) {
      if (err instanceof AxiosError) {
        printLog('error', err.message, err.status, err.response?.data);
      }
      throw new FeatureReleaseError(
        FeatureReleaseError.Code.ERROR_CANNOT_DOWNLOAD_CONFIG
      );
    }
  }

  private startPollingConfig(): void {
    if (this.timer) {
      throw new FeatureReleaseError(
        FeatureReleaseError.Code.ERROR_CONFIG_POLLING_ALREADY_STARTED
      );
    }

    const pollingIntervalInSeconds = this.options?.pollingIntervalInSeconds;
    const hostedConfigUrl = this.options?.hostedConfigUrl;

    if (pollingIntervalInSeconds && hostedConfigUrl) {
      this.timer = setInterval(async (): Promise<void> => {
        this.featureReleaseConfig =
          await FeatureRelease.downloadHostedFeatureReleaseConfig(
            hostedConfigUrl
          );
      }, pollingIntervalInSeconds * 1000);
    }
  }

  private static validateConfig(
    featureReleaseConfig: FeatureReleaseConfig
  ): void {
    try {
      featureReleaseConfigSchema.parse(featureReleaseConfig);
    } catch (err) {
      if (err instanceof ZodError) {
        printLog('error', err.issues);
        throw new FeatureReleaseError(
          FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG
        );
      }
      throw err;
    }
  }
  public updateFeatureReleaseConfig(
    featureReleaseConfig: FeatureReleaseConfig
  ): void {
    this.featureReleaseConfig = featureReleaseConfig;
  }

  public isEnabled(
    featureFlagName: string,
    uniqueTargetKey: string | number,
    namespace?: string
  ): boolean {
    const featureReleaseConfig: Rule | NamespacedRule =
      this.featureReleaseConfig?.[featureFlagName];

    if (!featureReleaseConfig) {
      printLog('warn', 'Unknown featureFlagName. False is returned.', {
        featureFlagName,
        namespace,
      });
      return false;
    }

    let rule: Rule;
    if (namespace && (featureReleaseConfig as NamespacedRule)[namespace]) {
      rule = (featureReleaseConfig as NamespacedRule)[namespace];
    } else {
      rule = featureReleaseConfig;
    }

    const resultByIndividualTarget = rule?.individualTargets?.[uniqueTargetKey];
    if (resultByIndividualTarget !== undefined) {
      return resultByIndividualTarget;
    }

    const releaseByPercentage = rule?.releaseByPercentage;
    if (releaseByPercentage !== undefined) {
      const salt = `${featureFlagName}.${namespace ?? ''}`; // Different result by percentage when a same key is used in different namespaces and feature flags.
      const hash = crypto
        .createHash('md5')
        .update(`${salt}.${uniqueTargetKey}`)
        .digest('hex');
      const num4Bytes = parseInt(hash.substring(0, 8), 16);
      const remain = num4Bytes % 100; // Between 0(inclusive) and 99(inclusive).

      return remain < releaseByPercentage; // true if the remain is smaller than the releaseByPercentage, otherwise, false.
    }

    return false;
  }
}

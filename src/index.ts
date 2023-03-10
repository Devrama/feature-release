import { FeatureReleaseError } from './errors/feature-release-error';
import { setDebugMode } from './helpers/logger';
import { FeatureRelease } from './lib/feature-release';
import { FeatureReleaseConfig } from './types';

let featureFlagInstance: FeatureRelease;

export const initFeatureRelease = (
  featureReleaseConfig: FeatureReleaseConfig,
  { debug = false }: { debug?: boolean } = {}
): FeatureRelease => {
  setDebugMode(debug);

  if (!featureFlagInstance) {
    featureFlagInstance = new FeatureRelease(featureReleaseConfig);
    return featureFlagInstance;
  }

  throw new FeatureReleaseError(
    FeatureReleaseError.Code.ERROR_ALREADY_INITIALIZED
  );
};

export const initFeatureReleaseAsync = async ({
  hostedConfigUrl,
  enableConfigPolling,
  pollingIntervalInSeconds,
  debug = false,
}: {
  hostedConfigUrl: string;
  enableConfigPolling?: boolean;
  pollingIntervalInSeconds?: number;
  debug?: boolean;
}): Promise<FeatureRelease> => {
  setDebugMode(debug);

  if (!featureFlagInstance) {
    const featureReleaseConfig =
      await FeatureRelease.downloadHostedFeatureReleaseConfig(hostedConfigUrl);

    featureFlagInstance = new FeatureRelease(featureReleaseConfig, {
      hostedConfigUrl,
      enableConfigPolling,
      pollingIntervalInSeconds,
    });

    return featureFlagInstance;
  }

  throw new FeatureReleaseError(
    FeatureReleaseError.Code.ERROR_ALREADY_INITIALIZED
  );
};

export type Rule = {
  releaseByPercentage?: number;
  individualTargets?: {
    [uniqueTargetKey: string]: boolean;
  };
};

export type NamespacedRule = {
  [namespace: string]: Rule;
};

export type FeatureReleaseConfig = {
  [featureFlagName: string]: Rule | NamespacedRule;
};

export type FeatureReleaseOptions = {
  hostedConfigUrl: string;
  enableConfigPolling?: boolean;
  pollingIntervalInSeconds?: number;
};

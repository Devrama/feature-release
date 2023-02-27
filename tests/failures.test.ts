import { FeatureReleaseError } from '../src/errors/feature-release-error';
import { initFeatureRelease } from '../src/index';

/*
  releaseByPercentage?: number;
  individualTargets?: {
    [uniqueTargetKey: string]: boolean;
  };
  */
describe('non-namespaced cases', () => {
  it('fails with an incorrect releaseByPercentage', () => {
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: 'abc' as unknown as number,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: 101,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: -1,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
  it('fails with an incorrect individualTargets', () => {
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          individualTargets: {
            someTarget: 'abc' as unknown as boolean,
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
});

describe('namespaced cases', () => {
  it('fails with an incorrect releaseByPercentage', () => {
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: 'abc' as unknown as number,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: 101,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          releaseByPercentage: -1,
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
  it('fails with an incorrect individualTargets in non-namespaced config', () => {
    expect(() =>
      initFeatureRelease({
        someTestFeatureFlag: {
          individualTargets: {
            someTarget: 'abc' as unknown as boolean,
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
  it('fails with an incorrect releaseByPercentage in namespaced config', () => {
    expect(() =>
      initFeatureRelease({
        someNamespace: {
          someTestFeatureFlag: {
            releaseByPercentage: 'abc' as unknown as number,
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someNamespace: {
          someTestFeatureFlag: {
            releaseByPercentage: 101,
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
    expect(() =>
      initFeatureRelease({
        someNamespace: {
          someTestFeatureFlag: {
            releaseByPercentage: -1,
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
  it('fails with an incorrect individualTargets', () => {
    expect(() =>
      initFeatureRelease({
        someNamespace: {
          someTestFeatureFlag: {
            individualTargets: {
              someTarget: 'abc' as unknown as boolean,
            },
          },
        },
      })
    ).toThrowError(
      new FeatureReleaseError(FeatureReleaseError.Code.ERROR_INCORRECT_CONFIG)
    );
  });
});

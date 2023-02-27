import { faker } from '@faker-js/faker';
import nock from 'nock';
import { FeatureReleaseError } from '../src/errors/feature-release-error';
import { initFeatureReleaseAsync } from '../src/index';
import { FeatureRelease } from '../src/lib/feature-release';
import {
  disabledTargetNumber,
  disabledTargetUUID,
  enabledTargetNumber,
  enabledTargetUUID,
  nonNamespacedConfig,
} from './fixtures/feature-flag-configs';
import { generateEnabledTargetKeyWithPercentage } from './helpers';

const NUM_OF_PERCENTAGE_SAMPLES = 50_000;
const NUM_OF_TARGET_SAMPLES = 1000;

describe('initFeatureReleaseAsync() with non-namespaced cases', () => {
  const percentageWithBothConfigured =
    nonNamespacedConfig.featureFlagNameWithRandomPercentageAndIndividualTargets
      .releaseByPercentage;
  const percentageWithOnlyConfigured =
    nonNamespacedConfig.featureFlagNameWithRandomPercentage.releaseByPercentage;

  let featureFlagInstance: FeatureRelease;

  beforeAll(async () => {
    const scope = nock('https://example.com')
      .persist()
      .get('/remote-config.json')
      .reply(200, nonNamespacedConfig);
    featureFlagInstance = await initFeatureReleaseAsync({
      hostedConfigUrl: 'https://example.com/remote-config.json',
    });
    scope.done();
  });

  describe.each`
    featureFlagName                                              | namespace    | releaseByPercentage             | individualTarget        | expected
    ${'featureFlagNameEmptyConfig'}                              | ${undefined} | ${undefined}                    | ${undefined}            | ${false}
    ${'featureFlagNameWithZeroPercentage'}                       | ${undefined} | ${0}                            | ${undefined}            | ${false}
    ${'featureFlagNameWith100Percentage'}                        | ${undefined} | ${100}                          | ${undefined}            | ${true}
    ${'featureFlagNameWithIndividualTargets'}                    | ${undefined} | ${undefined}                    | ${enabledTargetUUID}    | ${true}
    ${'featureFlagNameWithIndividualTargets'}                    | ${undefined} | ${undefined}                    | ${enabledTargetNumber}  | ${true}
    ${'featureFlagNameWithIndividualTargets'}                    | ${undefined} | ${undefined}                    | ${disabledTargetUUID}   | ${false}
    ${'featureFlagNameWithIndividualTargets'}                    | ${undefined} | ${undefined}                    | ${disabledTargetNumber} | ${false}
    ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${undefined} | ${percentageWithBothConfigured} | ${enabledTargetUUID}    | ${true}
    ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${undefined} | ${percentageWithBothConfigured} | ${enabledTargetNumber}  | ${true}
    ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${undefined} | ${percentageWithBothConfigured} | ${disabledTargetUUID}   | ${false}
    ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${undefined} | ${percentageWithBothConfigured} | ${disabledTargetNumber} | ${false}
  `(
    'Tests for the same result',
    ({
      featureFlagName,
      releaseByPercentage,
      namespace,
      individualTarget,
      expected,
    }) => {
      it(`always returns ${expected} if releaseByPercentage is ${releaseByPercentage} and individualTarget is ${
        individualTarget ? `configured with  ${expected}` : 'NOT configured'
      }`, () => {
        for (let i = 0; i < NUM_OF_TARGET_SAMPLES; i += 1) {
          if (individualTarget) {
            expect(
              featureFlagInstance.isEnabled(
                featureFlagName,
                individualTarget,
                namespace
              )
            ).toEqual(expected);
          } else {
            expect(
              featureFlagInstance.isEnabled(
                featureFlagName,
                faker.datatype.number(),
                namespace
              )
            ).toEqual(expected);
            expect(
              featureFlagInstance.isEnabled(
                featureFlagName,
                faker.datatype.uuid(),
                namespace
              )
            ).toEqual(expected);
          }
        }
      });
    }
  );

  describe.each`
    featureFlagName                                              | namespace    | releaseByPercentage             | hasIndividualTarget | expectEnabled
    ${'featureFlagNameWithRandomPercentage'}                     | ${undefined} | ${percentageWithOnlyConfigured} | ${false}            | ${undefined}
    ${'featureFlagNameWithFixed20Percentage'}                    | ${undefined} | ${20}                           | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed20Percentage', 20)}
    ${'featureFlagNameWithFixed40Percentage'}                    | ${undefined} | ${40}                           | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed40Percentage', 40)}
    ${'featureFlagNameWithFixed60Percentage'}                    | ${undefined} | ${60}                           | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed60Percentage', 60)}
    ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${undefined} | ${percentageWithBothConfigured} | ${true}             | ${undefined}
  `(
    'Tests for the percentage release',
    ({
      featureFlagName,
      releaseByPercentage,
      namespace,
      hasIndividualTarget,
      expectEnabled,
    }) => {
      it(`returns the result with +-1% margin  if 1) the samples are large enough always, 2) the percentage is configured with ${releaseByPercentage} 3) and individual target is ${
        hasIndividualTarget ? '' : 'NOT '
      }configured.`, () => {
        let count = 0;
        for (let i = 0; i < NUM_OF_PERCENTAGE_SAMPLES; i += 1) {
          const result = featureFlagInstance.isEnabled(
            featureFlagName,
            faker.datatype.number(),
            namespace
          );
          if (result === true) {
            count += 1;
          }
        }
        expect(
          (count / NUM_OF_PERCENTAGE_SAMPLES) * 100
        ).toBeGreaterThanOrEqual(releaseByPercentage - 1);
        expect((count / NUM_OF_PERCENTAGE_SAMPLES) * 100).toBeLessThanOrEqual(
          releaseByPercentage + 1
        );
      });

      if (expectEnabled) {
        test(`If the target key starts to be 'true' with the ${releaseByPercentage}%, it should always return 'true' after that percentage`, () => {
          let currentPercentage = 0;
          while (currentPercentage <= 100) {
            featureFlagInstance.updateFeatureReleaseConfig({
              ...nonNamespacedConfig,
              [featureFlagName]: {
                releaseByPercentage: currentPercentage,
              },
            });
            expect(
              featureFlagInstance.isEnabled(
                featureFlagName,
                expectEnabled,
                namespace
              )
            ).toEqual(currentPercentage > releaseByPercentage); // Because the internal range is between 0 ~ 99, not 100, we use '>' instead of '>='.

            currentPercentage += 1;
          }
        });
      }
    }
  );
  it('cannot reinitialize', async () => {
    const newInstance = initFeatureReleaseAsync({
      hostedConfigUrl: 'https://example.com/remote-config.json',
    });
    expect(newInstance).rejects.toThrowError(
      new FeatureReleaseError(
        FeatureReleaseError.Code.ERROR_ALREADY_INITIALIZED
      )
    );
  });
});

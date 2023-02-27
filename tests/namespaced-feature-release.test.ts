import { faker } from '@faker-js/faker';
import { FeatureReleaseError } from '../src/errors/feature-release-error';
import { initFeatureRelease } from '../src/index';
import { FeatureRelease } from '../src/lib/feature-release';
import { namespacedConfig } from './fixtures/feature-flag-configs';
import { generateEnabledTargetKeyWithPercentage } from './helpers';

const NUM_OF_PERCENTAGE_SAMPLES = 50_000;
const NUM_OF_TARGET_SAMPLES = 1000;

const percentageWithBothConfigured = (
  namespace: string
): number | undefined => {
  return namespacedConfig
    .featureFlagNameWithRandomPercentageAndIndividualTargets[
    namespace as 'prod' | 'staging' | 'arbitrary'
  ].releaseByPercentage;
};
const percentageWithOnlyConfigured = (namespace: string): number =>
  namespacedConfig.featureFlagNameWithRandomPercentage[
    namespace as 'prod' | 'staging' | 'arbitrary'
  ].releaseByPercentage;

describe('initFeatureRelease() with namespaced cases', () => {
  let featureFlagInstance: FeatureRelease;

  beforeAll(async () => {
    featureFlagInstance = await initFeatureRelease(namespacedConfig);
  });

  ['prod', 'staging', 'arbitrary'].forEach((namespace) => {
    describe.each`
      featureFlagName                                              | releaseByPercentage                        | individualTarget                | expected
      ${'featureFlagNameEmptyConfig'}                              | ${undefined}                               | ${undefined}                    | ${false}
      ${'featureFlagNameEmptyConfig'}                              | ${undefined}                               | ${undefined}                    | ${false}
      ${'featureFlagNameEmptyConfig'}                              | ${undefined}                               | ${undefined}                    | ${false}
      ${'featureFlagNameWithZeroPercentage'}                       | ${0}                                       | ${undefined}                    | ${false}
      ${'featureFlagNameWith100Percentage'}                        | ${100}                                     | ${undefined}                    | ${true}
      ${'featureFlagNameWithIndividualTargets'}                    | ${undefined}                               | ${`${namespace}EnabledTarget`}  | ${true}
      ${'featureFlagNameWithIndividualTargets'}                    | ${undefined}                               | ${`${namespace}EnabledTarget`}  | ${true}
      ${'featureFlagNameWithIndividualTargets'}                    | ${undefined}                               | ${`${namespace}DisabledTarget`} | ${false}
      ${'featureFlagNameWithIndividualTargets'}                    | ${undefined}                               | ${`${namespace}DisabledTarget`} | ${false}
      ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${percentageWithBothConfigured(namespace)} | ${`${namespace}EnabledTarget`}  | ${true}
      ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${percentageWithBothConfigured(namespace)} | ${`${namespace}DisabledTarget`} | ${false}
    `(
      'Tests for the same result',
      ({
        featureFlagName,
        releaseByPercentage,
        individualTarget,
        expected,
      }) => {
        it(`always returns ${expected} if releaseByPercentage is ${releaseByPercentage} and individualTarget is ${
          individualTarget ? `configured with ${expected}` : 'NOT configured'
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
  });

  ['prod', 'staging', 'arbitrary'].forEach((namespace) => {
    describe.each`
      featureFlagName                                              | releaseByPercentage                        | hasIndividualTarget | expectEnabled
      ${'featureFlagNameWithRandomPercentage'}                     | ${percentageWithOnlyConfigured(namespace)} | ${false}            | ${undefined}
      ${'featureFlagNameWithFixed20Percentage'}                    | ${20}                                      | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed20Percentage', 20, namespace)}
      ${'featureFlagNameWithFixed40Percentage'}                    | ${40}                                      | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed40Percentage', 40, namespace)}
      ${'featureFlagNameWithFixed60Percentage'}                    | ${60}                                      | ${false}            | ${generateEnabledTargetKeyWithPercentage('featureFlagNameWithFixed60Percentage', 60, namespace)}
      ${'featureFlagNameWithRandomPercentageAndIndividualTargets'} | ${percentageWithBothConfigured(namespace)} | ${true}             | ${undefined}
    `(
      'Tests for the percentage release',
      ({
        featureFlagName,
        releaseByPercentage,
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
                ...namespacedConfig,
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
  });
  it('cannot reinitialize', async () => {
    expect(() => initFeatureRelease(namespacedConfig)).toThrowError(
      new FeatureReleaseError(
        FeatureReleaseError.Code.ERROR_ALREADY_INITIALIZED
      )
    );
  });
});

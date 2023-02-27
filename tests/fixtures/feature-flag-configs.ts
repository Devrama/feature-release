import { faker } from '@faker-js/faker';

export const enabledTargetUUID = faker.datatype.uuid();
export const enabledTargetNumber = faker.datatype.number();
export const disabledTargetUUID = faker.datatype.uuid();
export const disabledTargetNumber = faker.datatype.number();

export const nonNamespacedConfig = {
  featureFlagNameEmptyConfig: {},
  featureFlagNameWithZeroPercentage: {
    releaseByPercentage: 0,
  },
  featureFlagNameWith100Percentage: {
    releaseByPercentage: 100,
  },
  featureFlagNameWithRandomPercentage: {
    releaseByPercentage: faker.datatype.number({
      min: 1,
      max: 99,
    }),
  },
  featureFlagNameWithFixed20Percentage: {
    releaseByPercentage: 20,
  },
  featureFlagNameWithFixed40Percentage: {
    releaseByPercentage: 40,
  },
  featureFlagNameWithFixed60Percentage: {
    releaseByPercentage: 60,
  },
  featureFlagNameWithIndividualTargets: {
    individualTargets: {
      [enabledTargetUUID]: true,
      [enabledTargetNumber]: true,
      [disabledTargetUUID]: false,
      [disabledTargetNumber]: false,
    },
  },
  featureFlagNameWithRandomPercentageAndIndividualTargets: {
    releaseByPercentage: faker.datatype.number({
      min: 1,
      max: 99,
    }),
    individualTargets: {
      [enabledTargetUUID]: true,
      [enabledTargetNumber]: true,
      [disabledTargetUUID]: false,
      [disabledTargetNumber]: false,
    },
  },
};

export const namespacedConfig = {
  featureFlagNameEmptyConfig: {
    prod: {},
    staging: {},
    arbitrary: {},
  },
  featureFlagNameWithZeroPercentage: {
    prod: {
      releaseByPercentage: 0,
    },
    staging: {
      releaseByPercentage: 0,
    },
    arbitrary: {
      releaseByPercentage: 0,
    },
  },
  featureFlagNameWith100Percentage: {
    prod: {
      releaseByPercentage: 100,
    },
    staging: {
      releaseByPercentage: 100,
    },
    arbitrary: {
      releaseByPercentage: 100,
    },
  },
  featureFlagNameWithRandomPercentage: {
    prod: {
      releaseByPercentage: faker.datatype.number({
        min: 1,
        max: 99,
      }),
    },
    staging: {
      releaseByPercentage: faker.datatype.number({
        min: 1,
        max: 99,
      }),
    },
    arbitrary: {
      releaseByPercentage: faker.datatype.number({
        min: 1,
        max: 99,
      }),
    },
  },
  featureFlagNameWithFixed20Percentage: {
    prod: {
      releaseByPercentage: 20,
    },
    staging: {
      releaseByPercentage: 20,
    },
    arbitrary: {
      releaseByPercentage: 20,
    },
  },
  featureFlagNameWithFixed40Percentage: {
    prod: {
      releaseByPercentage: 40,
    },
    staging: {
      releaseByPercentage: 40,
    },
    arbitrary: {
      releaseByPercentage: 40,
    },
  },
  featureFlagNameWithFixed60Percentage: {
    prod: {
      releaseByPercentage: 60,
    },
    staging: {
      releaseByPercentage: 60,
    },
    arbitrary: {
      releaseByPercentage: 60,
    },
  },
  featureFlagNameWithIndividualTargets: {
    prod: {
      individualTargets: {
        prodEnabledTarget: true,
        prodDisabledTarget: false,
      },
    },
    staging: {
      individualTargets: {
        stagingEnabledTarget: true,
        stagingDisabledTarget: false,
      },
    },
    arbitrary: {
      individualTargets: {
        arbitraryEnabledTarget: true,
        arbitraryDisabledTarget: false,
      },
    },
  },
  featureFlagNameWithRandomPercentageAndIndividualTargets: {
    prod: {
      releaseByPercentage: faker.datatype.number({
        min: 0,
        max: 100,
      }),
      individualTargets: {
        prodEnabledTarget: true,
        prodDisabledTarget: false,
      },
    },
    staging: {
      releaseByPercentage: faker.datatype.number({
        min: 0,
        max: 100,
      }),
      individualTargets: {
        stagingEnabledTarget: true,
        stagingDisabledTarget: false,
      },
    },
    arbitrary: {
      releaseByPercentage: faker.datatype.number({
        min: 0,
        max: 100,
      }),
      individualTargets: {
        arbitraryEnabledTarget: true,
        arbitraryDisabledTarget: false,
      },
    },
  },
};

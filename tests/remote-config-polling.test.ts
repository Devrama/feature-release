import nock from 'nock';
import { initFeatureReleaseAsync } from '../src/index';
import { delay } from './helpers';

jest.useFakeTimers({ advanceTimers: true });

it('todo', async () => {
  const config1 = {
    someFeatureFlag: {
      someTestFeatureFlag: {
        releaseByPercentage: 10,
        individualTargets: {
          someTarget1: true,
          someTarget2: false,
        },
      },
    },
  };
  const config2 = {
    someFeatureFlag: {
      someTestFeatureFlag: {
        releaseByPercentage: 20,
        individualTargets: {
          someTarget1: false,
          someTarget3: true,
        },
      },
    },
  };
  const scope1 = nock('https://example.com')
    .get('/remote-config.json')
    .reply(200, config1);
  const scope2 = nock('https://example.com')
    .get('/remote-config.json')
    .reply(200, config2);

  const featureFlagInstance = await initFeatureReleaseAsync({
    hostedConfigUrl: 'https://example.com/remote-config.json',
    enableConfigPolling: true,
    pollingIntervalInSeconds: 1,
  });

  scope1.done();
  expect(featureFlagInstance['featureReleaseConfig']).toEqual(config1);

  jest.advanceTimersByTime(1000);
  await delay(1); // Give some delay so that the config is stored before the test ends.

  scope2.done();
  expect(featureFlagInstance['featureReleaseConfig']).toEqual(config2);
});

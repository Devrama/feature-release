# feature-release

A simple feature flag management without hassle

# How to use?

## Simple usage by percentage release

### 1. Initialize feature flags

```typescript
/* my-feature-release.js */
const { initFeatureRelease } = require('feature-release');
// or import { initFeatureRelease } from 'feature-release';

const featureRelease = initFeatureRelease({
  myFirstFeatureFlag: {
    releaseByPercentage: 30,
  },
  mySecondFeatureFlag: {
    releaseByPercentage: 100,
  },
});

module.exports = {
  featureRelease,
};
```

### 2. Use the feature flags with unique IDs

```typescript
const { featureRelease } = require('./my-feature-release');

function newFeatureImplementation1(userID) {
  // The same userID will return the same result consistently.
  // For example, if userID, '12345', started to return true at 30%, it will
  // return true all from 30% to 100%.
  if (featureRelease.isEnabled('myFirstFeatureFlag', userID)) {
    return 'Oh! 30% of users will see this message!';
  } else {
    return 'Oh! 70% of users will see this message!';
  }
}

function newFeatureImplementation2(userID) {
  if (featureRelease.isEnabled('mySecondFeatureFlag', userID)) {
    return 'Oh! all users will see this message!';
  } else {
    return 'Oh! No user will see this message because you released 100%!';
  }
}
```

## Simple usage by individual targets

### 1. Initialize feature flags

```typescript
/* my-feature-release.js */
const { initFeatureRelease } = require('feature-release');
// or import { initFeatureRelease } from 'feature-release';

const featureRelease = initFeatureRelease({
  myFirstFeatureFlag: {
    individualTargets: {
      10001: true,
      10002: true,
    },
  },
  mySecondFeatureFlag: {
    individualTargets: {
      'foo@example.com': true,
      'bar@example.com': true,
    },
  },
});

module.exports = {
  featureRelease,
};
```

### 2. Use the feature flags with unique IDs

```typescript
const { featureRelease } = require('./my-feature-release');

function newFeatureImplementation1(userID) {
  if (featureRelease.isEnabled('myFirstFeatureFlag', userID)) {
    return 'Oh! the userID, 10001 and 10002, will see this message!';
  } else {
    return 'Oh! all other users see this message!';
  }
}

function newFeatureImplementation2(email) {
  if (featureRelease.isEnabled('mySecondFeatureFlag', email)) {
    return 'Oh! the emails, foo@example.com and bar@example.com, will see this message!';
  } else {
    return 'Oh! all other users see this message!';
  }
}
```

## Simple usage by both percentage and targets

### 1. Initialize feature flags

```typescript
/* my-feature-release.js */
const { initFeatureRelease } = require('feature-release');
// or import { initFeatureRelease } from 'feature-release';

const featureRelease = initFeatureRelease({
  myFirstFeatureFlag: {
    releaseByPercentage: 30,
    individualTargets: {
      10001: true,
      10002: false,
    },
  },
  mySecondFeatureFlag: {
    individualTargets: {
      'foo@example.com': false,
      'foo@example.com': false,
    },
    releaseByPercentage: 100,
  },
});

module.exports = {
  featureRelease,
};
```

### 2. Use the feature flags with unique IDs

```typescript
const { featureRelease } = require('./my-feature-release');

function newFeatureImplementation1(userID) {
  if (featureRelease.isEnabled('myFirstFeatureFlag', userID)) {
    return '1) the userID, 10001, will see this message. 2) 30% of users will see this message, too!';
  } else {
    return '1) the userID, 10002, will see this message. 2) 70% of users will see this message, too!';
  }
}

function newFeatureImplementation2(email) {
  if (featureRelease.isEnabled('mySecondFeatureFlag', email)) {
    return 'All users will see this message except foo@example.com and bar@example.com';
  } else {
    return 'foo@example.com and bar@example.com, will see this message even if it is released 100%';
  }
}
```

# Advanced usage

## Namespace

The `namespace` acts like an independent feature flag. However, it's convenient if you like to organize different subcategories under the same feature flag name.

### 1. Initialize feature flags

```typescript
/* my-feature-release.js */
const { initFeatureRelease } = require('feature-release');
// or import { initFeatureRelease } from 'feature-release';

const featureRelease = initFeatureRelease({
  myFirstFeatureFlag: {
    'prod-west1': {
      releaseByPercentage: 30,
      individualTargets: {
        10001: true,
      },
    },
    'prod-east1': {
      releaseByPercentage: 40,
      individualTargets: {
        10002: true,
      },
    },
  },
});

module.exports = {
  featureRelease,
};
```

### 2. Use the feature flags with unique IDs and the namespace

```typescript
const { featureRelease } = require('./my-feature-release');

function newFeatureImplementation1(userID, environment, region) {
  if (featureRelease.isEnabled('myFirstFeatureFlag', userID, `${environment}-${region}`)) {
    return 'Oh! 30% of users and userID(10001) in prod-west1 will see this message while 40% of users and userID(10002) in prod-east1 see this message';
  } else {
    return 'Oh! other users will see this message!';
  }
}
```

## Remote configuration

You can also pull the configuration from a remote server. There is also an option that pulls the configuration periodically. In this way, you are able to change the configuration remotely without restarting your application.

```typescript
/* my-feature-release.js */
const { initFeatureReleaseAsync } = require('feature-release');
// or import { initFeatureReleaseAsync } from 'feature-release';

let featureRelease = undefined;

async function getFeatureReleaseInstance() {
  if(!featureRelease) {
    featureRelease = await initFeatureReleaseAsync({
      hostedConfigUrl: 'https://example.com/remote-config.json',
      // enableConfigPolling: false, // Optional. Default to false. Pulls the configuration from the `hostedConfigUrl` every `pollingIntervalInSeconds` seconds.
      // pollingIntervalInSeconds: 60, // Optional. Default to 60 seconds.
    });
    return featureRelease;
  }

  return featureRelease;
}

module.exports = {
  getFeatureReleaseInstance,
};
```

Contributing to the LaunchDarkly Client-Side SDK for React Native
================================================

LaunchDarkly has published an [SDK contributor's guide](https://docs.launchdarkly.com/sdk/concepts/contributors-guide) that provides a detailed explanation of how our SDKs work. See below for additional information on how to contribute to this SDK.

Submitting bug reports and feature requests
------------------

The LaunchDarkly SDK team monitors the [issue tracker](https://github.com/launchdarkly/react-native-client-sdk/issues) in the SDK repository. Bug reports and feature requests specific to this SDK should be filed in this issue tracker. The SDK team will respond to all newly filed issues within two business days.

Submitting pull requests
------------------

We encourage pull requests and other contributions from the community. Before submitting pull requests, ensure that all temporary or unintended code is removed. Don't worry about adding reviewers to the pull request; the LaunchDarkly SDK team will add themselves. The SDK team will acknowledge all pull requests within two business days.

Build instructions
------------------

### Prerequisites

Follow the [React Native development environment setup guide](https://reactnative.dev/docs/environment-setup) to install all required tools for contributing to the project.

### Building and testing

First, install the dependencies by running:
```
npm install
```

To run tests of the JavaScript portion of the implementation:
```
npm test
```

To validate the TypeScript module definition, run:
```
npm run check-typescript
```

Testing the native module implementation must be done by integrating the SDK into an application, such as one created with `npx react-native init`.

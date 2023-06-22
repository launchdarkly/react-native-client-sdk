# LaunchDarkly Client-Side SDK for React Native

[![NPM](https://img.shields.io/npm/v/launchdarkly-react-native-client-sdk.svg)](https://www.npmjs.com/package/launchdarkly-react-native-client-sdk)
[![CircleCI](https://circleci.com/gh/launchdarkly/react-native-client-sdk.svg?style=shield)](https://circleci.com/gh/launchdarkly/react-native-client-sdk)
[![Documentation](https://img.shields.io/static/v1?label=GitHub+Pages&message=API+reference&color=00add8)](https://launchdarkly.github.io/react-native-client-sdk)

## LaunchDarkly overview

[LaunchDarkly](https://www.launchdarkly.com) is a feature management platform that serves trillions of feature flags daily to help teams build better software, faster. [Get started](https://docs.launchdarkly.com/home/getting-started) using LaunchDarkly today!

[![Twitter Follow](https://img.shields.io/twitter/follow/launchdarkly.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/intent/follow?screen_name=launchdarkly)

## Supported versions

This SDK is currently compatible with React Native versions >=0.69 <0.72, the minimum iOS deployment target is 11.0, and the minimum Android SDK version is 21. Builds are tested with XCode 12.5+.

For React Native 0.64.x - 0.68.x support, use the latest 6.3.x release.

For React Native 0.63.x support, use the latest 5.1.x release.

## Getting started

Refer to the [SDK documentation](https://docs.launchdarkly.com/sdk/client-side/react/react-native#getting-started) for instructions on getting started with using the SDK.

## Learn more

Read our [documentation](https://docs.launchdarkly.com) for in-depth instructions on configuring and using LaunchDarkly. You can also head straight to the [complete reference guide for this SDK](https://docs.launchdarkly.com/sdk/client-side/react/react-native).

## Testing

We run integration tests for all our SDKs using a centralized test harness. This approach gives us the ability to test for consistency across SDKs, as well as test networking behavior in a long-running application. These tests cover each method in the SDK, and verify that event sending, flag evaluation, stream reconnection, and other aspects of the SDK all behave correctly.

## Contributing

We encourage pull requests and other contributions from the community. Check out our [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute to this SDK.

## About LaunchDarkly

- LaunchDarkly is a continuous delivery platform that provides feature flags as a service and allows developers to iterate quickly and safely. We allow you to easily flag your features and manage them from the LaunchDarkly dashboard. With LaunchDarkly, you can:
  - Roll out a new feature to a subset of your users (like a group of users who opt-in to a beta tester group), gathering feedback and bug reports from real-world use cases.
  - Gradually roll out a feature to an increasing percentage of users, and track the effect that the feature has on key metrics (for instance, how likely is a user to complete a purchase if they have feature A versus feature B?).
  - Turn off a feature that you realize is causing performance problems in production, without needing to re-deploy, or even restart the application with a changed configuration file.
  - Grant access to certain features based on user attributes, like payment plan (eg: users on the ‘gold’ plan get access to more features than users in the ‘silver’ plan). Disable parts of your application to facilitate maintenance, without taking everything offline.
- LaunchDarkly provides feature flag SDKs for a wide variety of languages and technologies. Read [our documentation](https://docs.launchdarkly.com/sdk) for a complete list.
- Explore LaunchDarkly
  - [launchdarkly.com](https://www.launchdarkly.com/ 'LaunchDarkly Main Website') for more information
  - [docs.launchdarkly.com](https://docs.launchdarkly.com/ 'LaunchDarkly Documentation') for our documentation and SDK reference guides
  - [apidocs.launchdarkly.com](https://apidocs.launchdarkly.com/ 'LaunchDarkly API Documentation') for our API documentation
  - [blog.launchdarkly.com](https://blog.launchdarkly.com/ 'LaunchDarkly Blog Documentation') for the latest product updates

## Developing this SDK

- Run `yarn doctor` in both the root and ManualTestApp directories and make sure everything is green
  - If watchman fails, you can try installing it manually `brew reinstall watchman`
- Make sure you have [modd](https://github.com/cortesi/modd#install) installed so native code changes are hot reloaded

* For ios run `yarn dev-ios`
* For android run `yarn dev-android`

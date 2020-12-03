# Changelog

All notable changes to the LaunchDarkly React Native SDK will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org).

## [3.2.2] - 2020-12-02
### Fixed:
- Changed iOS all flags listener to only return `[LDFlagKey]` instead of `[LDFlagKey: LDChangedFlag]`. ([#61](https://github.com/launchdarkly/react-native-client-sdk/issues/61))



## [3.2.1] - 2020-08-26
### Fixed:
- `isInitialized` was failing when run in Android due to accessing an undefined variable. ([#55](https://github.com/launchdarkly/react-native-client-sdk/issues/55))

## [3.2.0] - 2020-07-10
### Changed:
- The SDK is now compatible with React Native version 0.63.x and React version 16.13.x.

### Removed:
- The SDK no longer supports iOS 9. This change was made to correspond to React Native 0.63&#39;s dropped support for iOS 9.

## [3.1.2] - 2020-05-21
### Fixed:
- The `track` method failed when called with a boolean `data` value and a non-null `metricValue`. (Thanks, [bolak](https://github.com/launchdarkly/react-native-client-sdk/pull/51)!)

## [3.1.1] - 2020-04-24
### Changed:
- Updated the Android target and compile versions to 28

## [3.1.0] - 2020-04-01
### Changed:
- The SDK is now compatible with React Native version 0.62.x and React version 16.11.x

## [3.0.2] - 2020-03-31
### Changed:
- Updated SDK code to build, run, and test on Xcode 11.4.

## [3.0.1] - 2020-02-26
### Added:
- Generated TypeDoc documentation for all types, properties, and methods is now available online at https://launchdarkly.github.io/react-native-client-sdk/. Currently this will only be for the latest released version.

### Fixed:
- Fixed some incorrect and incomplete typedoc comments.


## [3.0.0] - 2020-02-20
### Added:
- Added TypeScript type definitions (thanks, [eeynard](https://github.com/launchdarkly/react-native-client-sdk/pull/32)!)
- Added TypeDoc comments
- The SDK now specifies a uniquely identifiable request header when sending events to LaunchDarkly to ensure that events are only processed once, even if the SDK sends them two times due to a failed initial attempt.

### Changed:
- Changed the default value for the `anonymous` user property has been changed to `false`. Previously this default was inconsistent; the default value was `true` when running in iOS and `false` when running in Android.
- Changed the default value for the `backgroundPollingIntervalMillis` SDK configuration property has been changed to `3600000` (one hour). Previously this default was inconsistent; the default value was `900000` (15 minutes) when running in iOS and `3600000` (one hour) when running in Android.
- Changed the default value for the `disableBackgroundUpdating ` SDK configuration property has been changed to `false`. Previously this default was inconsistent; the default value was `true` when running in iOS and `false` when running in Android.

### Fixed:
- Fixed the `*VariationDetail` methods so that they now always return a promise containing the variation detail information. Previously, when running in Android, this promise would have instead contained just the variation value if the underlying process threw an exception.
- Fixed an issue where React Native apps could crash after reloading when running in iOS (thanks, [shercoder](https://github.com/launchdarkly/react-native-client-sdk/pull/39)!)

## [2.2.0] - 2020-01-24
### Added:
- Adds `evaluationReasons` configuration option.
- Adds `user.country` user option.

### Fixed:
- Fixes iOS start completion by adding new method `startCompleteWhenFlagsReceived`. This change creates feature parity between the start completion on iOS and Android. They now both complete when flag values are received.
- Fixes `EvaluationDetail` parsing from native to JS.


## [2.1.0] - 2019-12-23
### Added:
- Implemented `variationDetail` which returns an Evaluation Reason giving developers greater insight into why a value was returned.
- Added `allFlagsListener` method, this returns flag keys whenever any flag key is updated.
- Added `metricValue` parameter to `track` method.
- The Connection Status API allows greater introspection into the current LaunchDarkly connection and the health of local flags.
	- This feature adds a new method called `getConnectionInformation` that returns an object that contains the current connection mode e.g. streaming or polling, when and how a connection failed, and the last time flags were updated.
	- Additionally, a new observer function called `registerCurrentConnectionModeListener` allows your application to listen to changes in the SDK's connection to LaunchDarkly.
- A `close()` method which flushes the event queue and closes all open connections to LaunchDarkly. This method should be invoked as part of your application's termination lifecycle event.

### Changed:
- Updated the iOS SDK to version 4.3.2. This enables the removal of `use_frameworks!` from the Podfile in a project using the LaunchDarkly React Native SDK.
- Updated the Android SDK to version 2.9.0.
- Switched iOS user switching from the deprecated `user` object to the `identify` method.

## [2.0.3] - 2019-11-25
### Changed:
- The SDK's dependency on React Native has been expanded to include subsequent patch releases after `0.61.2`.

### Fixed:
- The Android package is properly namespaced now as `com.launchdarkly.reactnative`. Previously the Android module's package was `com.reactlibrary` which was prone to clash with other third-party modules' packages. ([#25](https://github.com/launchdarkly/react-native-client-sdk/issues/25))

## [2.0.2] - 2019-10-04
### Changed
- Updated React Native to version 0.61.2 and updated React to version 16.9.0

## [2.0.1] - 2019-06-27
### Fixed
- Listeners on Android now have the proper event emitter key and work properly.
- Flag values in the object returned by `allFlags`  will no longer be Strings when they should be JSON Objects on Android.

### Changed
- Updated Android Client SDK to version 2.8.5
- Updated iOS Client SDK to version 4.1.2

## [2.0.0] - 2019-06-27
### Fixed
- Changes polling mode to not be ignored in config.

### Changed
- Updated Android Client SDK to version 2.8.4
- Updated iOS Client SDK to version 4.1.0
- Updated React Native to version 0.59.9 and updated React to version 16.8.3
- Updated to allow usage with Xcode 10.2.1
- Updated Swift to version 5.0

 This is a major version because of breaking version updates.

## [1.0.1] - 2019-05-03
### Changed
- Changed the package name from `launchdarkly-react-native-client` to `launchdarkly-react-native-client-sdk`
- Changed repository references to use the new URL

There are no other changes in this release. Substituting `launchdarkly-react-native-client` version 1.0.0 with `launchdarkly-react-native-client-sdk` version 1.0.1 will not affect functionality.

## [1.0.0] - 2019-04-18
### Changed
- Android and iOS client versions
### Fixed
- Added correct anonymous property
- Removed dependencies and added caret to peer dependencies

### Note on future releases

The LaunchDarkly SDK repositories are being renamed for consistency. This repository is now `react-native-client-sdk` rather than `react-native-client`.

The package name will also change. In the 1.0.0 release, it is still `launchdarkly-react-native-client`; in all future releases, it will be `launchdarkly-react-native-client-sdk`.

## [1.0.0-beta.1] - 2019-03-01
### Added
- CHANGELOG.md and CONTRIBUTING.md
### Changed
- Moved `LaunchDarklyReactNativeClient.podspec` into `ios/`
### Fixed
- Changed `config.yml` to run against `hello-react-native`.

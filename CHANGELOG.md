# Changelog

All notable changes to the LaunchDarkly React Native SDK will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org).

## [6.1.1] - 2022-03-18
### Fixed:
- iOS: Fixed race condition in `LDSwiftEventSource` that could cause a crash if the stream is explicitly stopped (such as when `identify` is called) while the stream is waiting to reconnect.

## [6.1.0] - 2022-02-25
### Added:
- Added `privateAttributeNames` configuration option for `LDConfig` allowing the configuration of private attributes for all users. ([#102](https://github.com/launchdarkly/react-native-client-sdk/issues/102))

### Fixed:
- Android: Updated Android SDK dependency to [3.1.3](https://github.com/launchdarkly/android-client-sdk/releases/tag/3.1.3).
- Android: Added missing native module API stubs to prevent warning on `NativeEventEmitter`. ([#116](https://github.com/launchdarkly/react-native-client-sdk/issues/116))
- iOS: Fixed ownership handling of native callbacks to avoid garbage collection of all flags and connection mode listeners that are still in use. ([#106](https://github.com/launchdarkly/react-native-client-sdk/issues/106))

## [6.0.0] - 2022-02-10
### Added:
- Expanded supported versions of React Native to include 0.65, 0.66, and 0.67 releases.
- Added a manual testing application to the repository.
- Extensive testing of build configurations in CI to allow quicker validation of compatibility against multiple React Native releases and XCode versions.

### Changed:
- iOS: The native `podspec` for iOS has been renamed to fix automatic linking. Updating may require removing references to the old `podspec`.

### Fixed:
- iOS: Fixed an issue that prevented using `jsonVariation` and `jsonVariationDetail` with array default values. ([#112](https://github.com/launchdarkly/react-native-client-sdk/issues/112))

### Removed:
- Support for React Native 0.63.

## [5.1.1] - 2022-01-21
### Changed:
- The `key` property on `LDUser` objects is now optional, if it is not provided the SDK will automatically generate a key and mark the user as anonymous. See the [API documentation](https://launchdarkly.github.io/react-native-client-sdk/index.html#lduser) for more details.
- Updated native Android and iOS SDK to the [3.1.2 release](https://github.com/launchdarkly/android-client-sdk/releases/tag/3.1.2) and [5.4.4 release](https://github.com/launchdarkly/ios-client-sdk/releases/tag/5.4.4) respectively.

### Fixed:
- Android: Removed reference of `jcenter` from the Gradle build to reflect the shutdown of the JCenter artifact repository.
- iOS: `isOffline` has been corrected to no longer return `true` when online and `false` when offline.
- iOS: Fixed memory leak when stream connections are terminated caused by the native server sent events implementation.

## [5.1.0] - 2021-09-30
### Added:
- Added the `inlineUsersInEvents` configuration option which can be used to configure the SDK to include full user details in all analytics events.

### Changed:
- Restored compatibility with React Native 0.63, this version of the SDK can be used with either 0.63 or 0.64 React Native releases.

### Fixed:
- Added missing TypeScript definition for `autoAliasingOptOut` configuration field.
- Fixed an outdated `LDClient#isInitialized` description (Thanks, [christophby](https://github.com/launchdarkly/react-native-client-sdk/pull/97)!)

## [5.0.1] - 2021-09-03
### Fixed:
- Android: Fixed an inconsistency in the argument type given to all flags listeners. On Android the callback was given a string with a JSON representation of an array of strings, rather than an actual array of strings. (Thanks, [rodperottoni](https://github.com/launchdarkly/react-native-client-sdk/pull/91)!) ([#89](https://github.com/launchdarkly/react-native-client-sdk/issues/89))
- Android: Fixed runtime crashes caused by code shrinking when compiling with Proguard/R8. The SDK now specifies consumer Proguard rules for Android SDK methods accessed with runtime reflection.
- Android: Removed the `android:allowBackup` tag from the SDK's `AndroidManifest.xml` file to avoid requiring applications to explicitly replace the tag if given a different value. ([#138](https://github.com/launchdarkly/android-client-sdk/issues/138))
- Android: Changed the SDK's network detection check to consider network transport over a VPN as a connected state. This fixes an issue where the SDK would prevent network requests on a VPN due to considering the network to be unavailable. (Thanks, [lguipeng](https://github.com/launchdarkly/android-client-sdk/pull/137)!)

## [5.0.0] - 2021-08-20
### Added:
- The SDK now supports the ability to control the proportion of traffic allocation to an experiment. This works in conjunction with a new platform feature now available to early access customers.
- Added `numberVariation` and `numberVariationDetail` to LDClient.
- Added the `alias` method to LDClient. This can be used to associate two user objects for analytics purposes with an alias event.
- Added the `autoAliasingOptOut` configuration option. This can be used to control the new automatic aliasing behavior of the `identify` method; by setting `autoAliasingOptOut` to true, `identify` will not automatically generate alias events.
- Improved testing of JavaScript wrapper using mock native modules.

### Changed (requirements/dependencies/build):
- iOS: The underlying SDK version has been updated from 5.4.1 to 5.4.3. See the [release notes](https://github.com/launchdarkly/ios-client-sdk/releases) for details.
- Android: The underlying SDK version has been updated from 2.14.1 to 3.1.0. See the [release notes](https://github.com/launchdarkly/android-client-sdk/releases) for details.
- Android: Migrated from using the Android Support Libraries to using AndroidX from Jetpack.
- Android: The minimum API version has been raised from API level 16 (Android 4.1 Jelly Bean) to API level 21 (Android 5.0 Lollipop).
- Android: The SDK no longer has a dependency on Google Play Services. This dependency was only used on pre-21 Android API levels to improve TLS 1.2 compatibility, as the minimum Android version has been raised to 21, the dependency is no longer necessary.
- Android: The SDK is now built with modern Gradle (6.7, Android plugin 4.1.3) and uses Java 8.

### Changed (API/behavioral):
- The `LDClient.identify` method will now automatically generate an alias event when switching from an anonymous to a known user. This event associates the two users for analytics purposes as they most likely represent a single person. This behavior can be disabled with the `autoAliasingOptOut` configuration option.
- The `LDClient` `&lt;type&gt;Variation` and `&lt;type&gt;VariationDetail` methods (e.g. `boolVariation`) now validate that default values are the correct type. If the default value fails validation the `Promise` will be rejected.
- The primitive variation methods, `LDClient.boolVariation`, `LDClient.boolVariationDetail`, `LDClient.numberVariation`, and `LDClient.numberVariationDetail`, now require a default value parameter (rather than being optional). If missing, the `Promise` will be rejected.
- Android: `LDClient.allFlags` will no longer convert `String` flags into JSON `Array`s or `Object`s when the value can be parsed into JSON `Array`s or `Object`s. 
- Android: For compatibility with older SDK behavior, the `LDClient.stringVariation` method could be used to retrieve JSON flags in a serialized representation. This compatibility behavior has been removed, and attempts to request a JSON valued flag using stringVariation will behave the same as other mismatched type variation calls.
- Android: All log messages are now tagged `LaunchDarklySdk` for easier filtering. Thanks to @valeriyo for the suggestion ([#113](https://github.com/launchdarkly/android-client-sdk/issues/113)).
- Android: The when the `country` user is set, the SDK will no longer attempt to look up the country from the provided `String` (attempting to match it as an ISO-3166-1 alpha-2, alpha-3 code; or a country name) and set the country to the resultant IOS-3166-1 alpha-2 only if successful. The SDK no longer gives this attribute special behavior, and sets the user&#39;s country attribute directly as the provided `String`.
- Android: If the `debugMode` configuration option is set to `true`, the SDK will now enable detailed timber logging.
- Android: Custom user attributes that are `Object`s will no longer be ignored.
- Android: Elements of `Array` custom user attributes will no longer be ignored if they are not `String`s or `Number`s.
- Android: `Array` custom user attributes with mixed types will no longer ignore non-`String` elements.

### Fixed (Android):
- Catch `SecurityException` when thrown on call to `getNetworkCapabilities` used to detect current network availability. ([#129](https://github.com/launchdarkly/android-client-sdk/issues/129))
- Explicitly flag `PendingIntent`s as `FLAG_IMMUTABLE` on Android SDK versions that support doing so. Explicitly specifying mutability is required when targeting Android S&#43;. ([#133](https://github.com/launchdarkly/android-client-sdk/issues/133))
- Increased the compile-time dependency on `jackson-databind` to 2.10.5.1, due to [CVE-2020-25649](https://nvd.nist.gov/vuln/detail/CVE-2020-25649).
- Update the dependency on the shared [launchdarkly/java-sdk-common](https://github.com/launchdarkly/java-sdk-common) to 1.1.2 to prevent Jackson from showing up as a transitive dependency in tools that inspect module metadata.
- The Android manifest has been updated to explicitly specify the `android:exported` attribute on declared `receiver` elements. This is to meet [new requirements](https://developer.android.com/about/versions/12/behavior-changes-12#exported) in the upcoming Android 12 release.
- Fixed an issue where the SDK could log error level messages when attempting to send diagnostic events without an internet connection. The SDK will no longer attempt to send diagnostic events when an internet connection is known to be unavailable, and will not log an error level message if the connection fails. Thanks to @valeriyo for reporting ([#107](https://github.com/launchdarkly/android-client-sdk/issues/107)).
- Fixed an issue where flags listeners would be informed of changes to unchanged flags whenever the SDK receives an entire flag set (on a new stream connection, a poll request, or any stream updates behind a relay proxy).
- Fixed an issue where a `NullPointerException` is thrown if `LDClient.close()` is called multiple times.
- Improved the proguard/R8 configuration to allow more optimization. Thanks to @valeriyo for requesting ([#106](https://github.com/launchdarkly/android-client-sdk/issues/106))
- Fixed a potential issue where the SDK could cause additional throttling on requests to the backend service when previously throttled requests had been cancelled before completion.

### Fixed (iOS):
- Fixed an issue where `304 NOT_MODIFIED` responses to SDK polling mode requests would be considered error responses. This could cause the completion on a `identify` request to not complete, and gave erroneous connection information data and logging output. 
- Fixed a crash when attempting to cache flag data containing variation JSON values containing a JSON `null` value nested within a JSON array.
- Avoid crash when timeout/interval configuration options are set to sufficiently large values. This was caused when converting these values to an `Int` value of milliseconds. (Thanks, [@delannoyk](https://github.com/launchdarkly/ios-client-sdk/pull/246)!) 
- Update `Quick` test dependency to 3.1.2 to avoid build warnings and adopt security fixes. ([#243](https://github.com/launchdarkly/ios-client-sdk/issues/243))
- Use `AnyObject` over `class` in protocol inheritance to avoid compiler warnings. ([#247](https://github.com/launchdarkly/ios-client-sdk/issues/247))

### Removed:
- `LDClient.intVariation` and `LDClient.floatVariation`. Please use `LDClient.numberVariation` instead.
- `LDClient.intVariationDetail` and `LDClient.floatVariationDetail`. Please use `LDClient.numberVariationDetail` instead.


## [4.2.2] - 2021-06-15
### Fixed:
- Correct usages of undeclared variables when registering or un-registering connection mode or all flags listeners. ([#82](https://github.com/launchdarkly/react-native-client-sdk/issues/82))

## [4.0.4] - 2021-06-02
### Fixed:
- iOS: Fixed an issue where an exception was thrown when calling `LDClient.configure` with an optional `timeout` ([#80](https://github.com/launchdarkly/react-native-client-sdk/issues/80)).

## [4.2.1] - 2021-06-01
### Fixed:
- iOS: Fixed an issue where an exception was thrown when calling `LDClient.configure` with an optional `timeout` ([#80](https://github.com/launchdarkly/react-native-client-sdk/issues/80)).
- iOS: Improved consistency with Android for `LDClient.isInitialized`. Both implementations will now reject the promise if the client has not been configured.
- iOS: Avoid exceptions on iOS when certain methods are called after `LDClient.close`. (Thanks, [andvalsol](https://github.com/launchdarkly/react-native-client-sdk/pull/78))! ([#75](https://github.com/launchdarkly/react-native-client-sdk/issues/75))
- Android: Fixed an issue where the promise for `LDClient.configure` could be resolved before the client had finished initializing when not providing the optional `timeout` parameter.
- Android: Fixed an issue where `LDClient.allFlags` would reject the promise when the client was configured but not yet initialized, rather than resolving with any cached flags.

## [4.2.0] - 2021-05-19
### Added:
- `LDUser` now has an optional `secondary` attribute to match other LaunchDarkly SDKs. For more on the behavior of this attribute see [the documentation on targeting users](https://docs.launchdarkly.com/home/flags/targeting-users).
- Support for multiple LaunchDarkly projects or environments. Each set of feature flags associated with a mobile key is called an environment. ([#10](https://github.com/launchdarkly/react-native-client-sdk/issues/10))
  - `secondaryMobileKeys` is now a config option which allows a mapping of names to the SDK keys for each additional environment. `mobileKey` is still required, and represents the primary environment.
  - Many methods including variations, track, and listeners now support an optional `environment` parameter to evaluate the method against the given `environment`.

## [4.1.2] - 2021-04-28
### Fixed:
- The `LDEvaluationReasonErrorKind`, `LDEvaluationReasonKind`, `LDConnectionMode`, and `LDFailureReason` enum TypeScript types were undefined when evaluated at runtime due to being defined in an ambient context. This was also fixed in SDK version 4.0.3 with React Native 0.63 compatibility.

## [4.0.3] - 2021-04-28
### Fixed:
- The `LDEvaluationReasonErrorKind`, `LDEvaluationReasonKind`, `LDConnectionMode`, and `LDFailureReason` enum TypeScript types were undefined when evaluated at runtime due to being defined in an ambient context.

## [4.1.1] - 2021-04-23
### Fixed:
- Android: Fixed an issue where the `jsonVariationDetail` method in `LDClient` returned `Promise<Record<string, any>>` instead of the declared return type of `Promise<LDEvaluationDetail<Record<string, any>>>`. This was also fixed in SDK version 4.0.2 with React Native 0.63 compatibility.

## [4.0.2] - 2021-04-23
### Fixed:
- Android: Fixed an issue where the `jsonVariationDetail` method in `LDClient` returned `Promise<Record<string, any>>` instead of the declared return type of `Promise<LDEvaluationDetail<Record<string, any>>>`.

## [4.1.0] - 2021-04-13
### Added:
- The SDK is now compatible with React Native version 0.64.x. ([#69](https://github.com/launchdarkly/react-native-client-sdk/issues/69))

### Removed:
- The SDK no longer requires React as a peer dependency. React compatibility is dictated based on its compatibility with the React Native version.

## [4.0.1] - 2021-04-06
### Fixed:
- iOS: Internal throttling logic would sometimes delay new poll or stream connections even when there were no recent connections. This caused switching active user contexts using `identify` to sometimes delay retrieving the most recent flags, and therefore delay the completion of the returned Promise.


## [4.0.0] - 2021-03-31
### Added:
- Added `getConnectionMode`, `getLastSuccessfulConnection`, `getLastFailedConnection`, and `getLastFailure` methods to `LDClient`. These methods can be used to report on the SDK&#39;s connection to LaunchDarkly. The new `LDConnectionMode` and `LDFailureReason` enum types have been added to support these methods. These methods replace the `getConnectionInformation` method which behaved differently across platforms.
- Added a `getVersion` method to `LDClient` to get the version of the React Native SDK.
- Added an optional `timeout` value to the `configure` method to specify that the SDK should block up to a specified duration while initializing.
- Added a new client configuration option, `maxCachedUsers`, to `LDClientConfig`. You can now specify the number of users to be cached locally on the device or use `-1` for unlimited cached users.
- Added new user configuration options, `ip` and `avatar`, to `LDUserConfig`.
- The SDK now periodically sends diagnostic data to LaunchDarkly, describing the version and configuration of the SDK, the operating system the SDK is running on, the device type (such as &#34;iPad&#34;), and performance statistics. No credentials, device IDs, or other identifiable values are included. This behavior can be disabled or configured with the new `LDClientConfig` properties `diagnosticOptOut` and `diagnosticRecordingInterval`.
- Added reporting of the SDK&#39;s &#34;wrapper name&#34; and &#34;wrapper version&#34; for internal reporting purposes.
- iOS: Added XCode 12 support ([#64](https://github.com/launchdarkly/react-native-client-sdk/issues/64))
- iOS: Added support for the `isInitialized` method. Previously this method only worked when running on Android.

### Changed:
- Renamed the `LDClientConfig` type to `LDConfig` for consistency with other LaunchDarkly SDKs. Corresponding parameter names and documentation have also been updated to reflect this change.
- Renamed the `LDUserConfig` type to `LDUser` for consistency with other LaunchDarkly SDKs. Corresponding parameter names and documentation have also been updated to reflect this change.
- Renamed `baseUri` in `LDConfig` (formerly `LDClientConfig`) to `pollUri` to clarify that this URI is only used when polling.
- The `fallback` parameter of all `LDClient` variation methods has been renamed to `defaultValue` to help distinguish it from `fallback` values in rules specified in the LaunchDarkly dashboard.
- Changed the default polling domain from `app.launchdarkly.com` to `clientsdk.launchdarkly.com`.
- Android: Updated the Android SDK native module from 2.10.0 to [2.14.1](https://github.com/launchdarkly/android-client-sdk/releases/tag/2.14.1)
- Android: Error stacktrace logging in the bridge layer now uses Timber instead of `System.err`
- iOS: Updated the iOS SDK native module from 4.5.0 to [5.4.0](https://github.com/launchdarkly/ios-client-sdk/releases/tag/5.4.0) ([#65](https://github.com/launchdarkly/react-native-client-sdk/issues/65))
- iOS: The minimum iOS deployment target has been updated from 8.0 to 10.0.
- iOS: The maximum backoff delay between failed streaming connections has been reduced from an hour to 30 seconds. This is to prevent being unable to receive new flag values for up to an hour if the SDK has reached its maximum backoff due to a period of network connectivity loss.
- iOS: The backoff on streaming connections will not be reset after just a successful connection, rather waiting for a healthy connection for one minute after receiving flags. This is to reduce congestion in poor network conditions or if extreme load prevents the LaunchDarkly service from maintaining an active streaming connection.
- iOS: When sending events to LaunchDarkly, the SDK will now retry the request after a one second delay if it fails.
- iOS: When events fail to be sent to LaunchDarkly, the SDK will no longer retain the events. This prevents double recording events when the LaunchDarkly service received the event but the SDK failed to receive the acknowledgement.

### Fixed:
- The `getConnectionInformation` method in `LDClient` had inconsistent return types across the iOS and Android platforms. This API has been split into separate methods which are consistently typed across platforms - see the notes above. ([#59](https://github.com/launchdarkly/react-native-client-sdk/issues/59))
- Android: Fixed an issue where `identify` ran on the current thread instead of on a background thread (thanks, [orthanc](https://github.com/launchdarkly/react-native-client-sdk/pull/66) and [hackdie](https://github.com/launchdarkly/react-native-client-sdk/pull/58)!)
- Android: Fixed an issue where an exception was thrown if `configure` was invoked multiple times. Now, subsequent invocations result in a rejected promise. ([#40](https://github.com/launchdarkly/react-native-client-sdk/issues/40))
- Android: Fixed an issue where the `evaluationReasons` option in `LDClientConfig` was not used when configuring the Android SDK native module.
- Android: Fixed an issue where `NullPointerException`s were possible if certain methods were invoked while the client was initializing (discussed in [#55](https://github.com/launchdarkly/react-native-client-sdk/issues/55#issuecomment-681173212))
- Android: Fixed an issue where initialization may never complete if the network status of foreground state changed before the future had completed.
- Android: Fixed an issue where a `NullPointerException` could occur when calling a variation method with a flag key that does not exist locally or is of the wrong type. This issue could only occur if a null fallback value was provided.
- Android: Improved event summarization logic to avoid potential runtime exceptions.
- Android: Internal throttling logic would sometimes delay new poll or stream connections even when there were no recent connections. This caused switching active user contexts using `identify` to sometimes delay retrieving the most recent flags, and therefore delay the completion of the returned Promise.
- Android: Previously, the SDK manifest required the SET_ALARM permission. This permission was never used, so it has been removed.
- Android: Improved handling of exceptions thrown by the alarm manager on Samsung devices.
- iOS: Fixed an issue preventing private custom attribute names being recorded in events when all custom attributes are set to be private by including &#34;custom&#34; in the `LDUserConfig.privateAttributeNames` or `LDClientConfig.allUserAttributesPrivate` properties.
- iOS: Fixed an issue to prevent a crash that would rarely occur as the SDK transitioned to an online state for a given configuration or user. This issue may have been exacerbated for a short period due to a temporary change in the behavior of the LaunchDarkly service streaming endpoint.
- OS: Fix `metricValue` argument to `track` to work with all numbers.

### Removed:
- Removed the `LDClientConfig` type.
- Removed the `LDUserConfig` type.
- Removed the `getConnectionInformation` method in `LDClient`.
- Removed the `isDisableBackgroundPolling` method in `LDClient`.
- Removed the `baseUri` attribute in `LDConfig` (formerly `LDClientConfig`).

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

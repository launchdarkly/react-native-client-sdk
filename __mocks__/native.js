const mockNativeModule = {
  FLAG_PREFIX: "test-flag-prefix",
  ALL_FLAGS_PREFIX: "test-all-flags-prefix",
  CONNECTION_MODE_PREFIX: "test-connection-mode-prefix",

  configure: jest.fn(),
  configureWithTimeout: jest.fn(),

  boolVariation: jest.fn(),
  boolVariationDefaultValue: jest.fn(),
  numberVariation: jest.fn(),
  numberVariationDefaultValue: jest.fn(),
  stringVariation: jest.fn(),
  stringVariationDefaultValue: jest.fn(),
  jsonVariationNone: jest.fn(),
  jsonVariationNumber: jest.fn(),
  jsonVariationBool: jest.fn(),
  jsonVariationString: jest.fn(),
  jsonVariationArray: jest.fn(),
  jsonVariationObject: jest.fn(),

  boolVariationDetail: jest.fn(),
  boolVariationDetailDefaultValue: jest.fn(),
  numberVariationDetail: jest.fn(),
  numberVariationDetailDefaultValue: jest.fn(),
  stringVariationDetail: jest.fn(),
  stringVariationDetailDefaultValue: jest.fn(),
  jsonVariationDetailNone: jest.fn(),
  jsonVariationDetailNumber: jest.fn(),
  jsonVariationDetailBool: jest.fn(),
  jsonVariationDetailString: jest.fn(),
  jsonVariationDetailArray: jest.fn(),
  jsonVariationDetailObject: jest.fn(),

  allFlags: jest.fn(),

  trackNumber: jest.fn(),
  trackBool: jest.fn(),
  trackString: jest.fn(),
  trackArray: jest.fn(),
  trackObject: jest.fn(),
  track: jest.fn(),

  trackNumberMetricValue: jest.fn(),
  trackBoolMetricValue: jest.fn(),
  trackStringMetricValue: jest.fn(),
  trackArrayMetricValue: jest.fn(),
  trackObjectMetricValue: jest.fn(),
  trackMetricValue: jest.fn(),

  setOffline: jest.fn(),
  isOffline: jest.fn(),
  setOnline: jest.fn(),
  isInitialized: jest.fn(),
  isInitializedSafe: jest.fn(),
  flush: jest.fn(),
  close: jest.fn(),
  identify: jest.fn(),
  alias: jest.fn(),
  getConnectionMode: jest.fn(),
  getLastSuccessfulConnection: jest.fn(),
  getLastFailedConnection: jest.fn(),
  getLastFailure: jest.fn(),

  registerFeatureFlagListener: jest.fn(),
  unregisterFeatureFlagListener: jest.fn(),
  registerCurrentConnectionModeListener: jest.fn(),
  unregisterCurrentConnectionModeListener: jest.fn(),
  registerAllFlagsListener: jest.fn(),
  unregisterAllFlagsListener: jest.fn()
};

jest.mock('react-native',
  () => {
    return {
      NativeModules: {
        LaunchdarklyReactNativeClient: mockNativeModule
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => {
        return { addListener: jest.fn() };
      })
    }
  },
  { virtual: true }
);

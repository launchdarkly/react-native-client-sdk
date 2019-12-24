import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

let LaunchdarklyReactNativeClient = NativeModules.LaunchdarklyReactNativeClient;

export default class LDClient {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(LaunchdarklyReactNativeClient);
    this.flagListeners = {};
    this.allFlagsListeners = {};
    this.connectionModeListeners = {};
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.FLAG_PREFIX, body => this._flagUpdateListener(body));
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.ALL_FLAGS_PREFIX, body => this._allFlagsUpdateListener(body));
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.CONNECTION_MODE_PREFIX, body => this._connectionModeUpdateListener(body));
  }

  configure(config, userConfig) {
    return LaunchdarklyReactNativeClient.configure(config, userConfig);
  }

  boolVariation(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.boolVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationFallback(flagKey, fallback);
    }
  }

  intVariation(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.intVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.intVariationFallback(flagKey, fallback);
    }
  }

  floatVariation(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.floatVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationFallback(flagKey, fallback);
    }
  }

  stringVariation(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.stringVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationFallback(flagKey, fallback);
    }
  }

  jsonVariation(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariationNone(flagKey);
    } else if (typeof fallback === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationNumber(flagKey, fallback);
    } else if (typeof fallback === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationBool(flagKey, fallback);
    } else if (typeof fallback === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationString(flagKey, fallback);
    } else if (Array.isArray(fallback)) {
      return LaunchdarklyReactNativeClient.jsonVariationArray(flagKey, fallback);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationObject(flagKey, fallback);
    }
  }

  boolVariationDetail(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.boolVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationDetailFallback(flagKey, fallback);
    }
  }

  intVariationDetail(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.intVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.intVariationDetailFallback(flagKey, fallback);
    }
  }

  floatVariationDetail(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.floatVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationDetailFallback(flagKey, fallback);
    }
  }

  stringVariationDetail(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.stringVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationDetailFallback(flagKey, fallback);
    }
  }

  jsonVariationDetail(flagKey, fallback) {
    if (fallback == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariatioDetailNone(flagKey);
    } else if (typeof fallback === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailNumber(flagKey, fallback);
    } else if (typeof fallback === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailBool(flagKey, fallback);
    } else if (typeof fallback === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailString(flagKey, fallback);
    } else if (Array.isArray(fallback)) {
      return LaunchdarklyReactNativeClient.jsonVariationDetailArray(flagKey, fallback);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationDetailObject(flagKey, fallback);
    }
  }

  allFlags() {
    return LaunchdarklyReactNativeClient.allFlags();
  }

  track(eventName, data, metricValue) {
    if (metricValue) {
      if (data === null || typeof data === 'undefined') {
        LaunchdarklyReactNativeClient.trackMetricValue(eventName, metricValue);
      } else if (typeof data === 'number') {
        LaunchdarklyReactNativeClient.trackNumberMetricValue(eventName, data, metricValue);
      } else if (typeof data === 'boolean') {
        LaunchdarklyReactNativeClient.trackBoolMetricValuel(eventName, data, metricValue);
      } else if (typeof data === 'string') {
        LaunchdarklyReactNativeClient.trackStringMetricValue(eventName, data, metricValue);
      } else if (Array.isArray(data)) {
        LaunchdarklyReactNativeClient.trackArrayMetricValue(eventName, data, metricValue);
      } else {
        // should be an object
        LaunchdarklyReactNativeClient.trackObjectMetricValue(eventName, data, metricValue);
      }
    } else {
      if (data === null || typeof data === 'undefined') {
        LaunchdarklyReactNativeClient.track(eventName);
      } else if (typeof data === 'number') {
        LaunchdarklyReactNativeClient.trackNumber(eventName, data);
      } else if (typeof data === 'boolean') {
        LaunchdarklyReactNativeClient.trackBool(eventName, data);
      } else if (typeof data === 'string') {
        LaunchdarklyReactNativeClient.trackString(eventName, data);
      } else if (Array.isArray(data)) {
        LaunchdarklyReactNativeClient.trackArray(eventName, data);
      } else {
        // should be an object
        LaunchdarklyReactNativeClient.trackObject(eventName, data);
      }
    }
  }

  setOffline() {
    return LaunchdarklyReactNativeClient.setOffline();
  }

  isOffline() {
    return LaunchdarklyReactNativeClient.isOffline();
  }

  setOnline() {
    return LaunchdarklyReactNativeClient.setOnline();
  }

  isInitialized() {
    if(Platform.OS === 'android') {
      return LaunchdarklyReactNativeClient.isInitialized(promise);
    } else {
      return Promise.reject("Function is not available on this platform");
    }
  }

  flush() {
    LaunchdarklyReactNativeClient.flush();
  }

  close() {
    LaunchdarklyReactNativeClient.close();
  }

  identify(userConfig) {
    return LaunchdarklyReactNativeClient.identify(userConfig);
  }

  isDisableBackgroundPolling() {
    return LaunchdarklyReactNativeClient.isDisableBackgroundPolling();
  }

  _flagUpdateListener(changedFlag) {
    const flagKey = changedFlag.flagKey;
    if (this.flagListeners.hasOwnProperty(flagKey)) {
      let listeners = this.flagListeners[flagKey];
      for (const listener of listeners) {
        listener(flagKey);
      }
    }
  }

  _allFlagsUpdateListener(changedFlags) {
    const flagKeys = changedFlags.flagKeys;
    let listeners = Object.values(this.allFlagsListeners);
    for (const listener of listeners) {
      listener(flagKeys);
    }
  }

  _connectionModeUpdateListener(connectionStatus) {
    const connectionMode = connectionStatus.connectionMode;
    let listeners = Object.values(this.connectionModeListeners);
    for (const listener of listeners) {
      listener(connectionMode);
    }
  }

  registerFeatureFlagListener(flagKey, callback) {
    if (typeof callback !== "function") {
      return;
    }

    if (this.flagListeners.hasOwnProperty(flagKey)) {
      this.flagListeners[flagKey].push(callback);
    } else {
      this.flagListeners[flagKey] = [callback];

      LaunchdarklyReactNativeClient.registerFeatureFlagListener(flagKey);
    }
  }

  unregisterFeatureFlagListener(flagKey, callback) {
    if (!this.flagListeners.hasOwnProperty(flagKey))
      return;

    this.flagListeners[flagKey] =
      this.flagListeners[flagKey].filter(listener => listener != callback);

    if (this.flagListeners[flagKey].length == 0) {
      LaunchdarklyReactNativeClient.unregisterFeatureFlagListener(flagKey);
      delete this.flagListeners[flagKey];
    }
  }

  getConnectionInformation() {
    return LaunchdarklyReactNativeClient.getConnectionInformation();
  }

  registerCurrentConnectionModeListener(listenerId, callback) {
    if (typeof callback !== "function") {
      return;
    }

    this.connectionModeListeners[listenerId] = callback;
    LaunchdarklyReactNativeClient.registerCurrentConnectionModeListener(listenerId);
  }

  unregisterCurrentConnectionModeListener(listenerId) {
    if (!this.connectionModeListeners.hasOwnProperty(listenerId))
      return;

    LaunchdarklyReactNativeClient.unregisterCurrentConnectionModeListener(listenerId);
    delete this.connectionModeListeners[listenerId];
  }

  registerAllFlagsListener(listenerId, callback) {
    if (typeof callback !== "function") {
      return;
    }
    
    this.allFlagsListeners[listenerId] = callback;
    LaunchdarklyReactNativeClient.registerAllFlagsListener(listenerId);
  }

  unregisterAllFlagsListener(listenerId) {
    if (!this.allFlagsListeners.hasOwnProperty(listenerId))
      return;

    LaunchdarklyReactNativeClient.unregisterAllFlagsListener(listenerId);
    delete this.allFlagsListeners[listenerId];
  }
}

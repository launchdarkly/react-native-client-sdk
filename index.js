import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { version } from './package.json';

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

  getVersion() {
    return String(version);
  }

  configure(config, user, timeout) {
    if (this.isInitialized() == true) {
      Promise.reject('LaunchDarkly SDK already initialized');
    }
    const configWithOverriddenDefaults = Object.assign({
      backgroundPollingIntervalMillis: 3600000, // the iOS SDK defaults this to 900000
      disableBackgroundUpdating: false,         // the iOS SDK defaults this to true
      pollUri: 'https://clientsdk.launchdarkly.com',
      wrapperName: 'react-native-client-sdk',
      wrapperVersion: this.getVersion()
    }, config);
    
    if (timeout == undefined) {
      return LaunchdarklyReactNativeClient.configure(configWithOverriddenDefaults, this._addUserOverrides(user));
    } else {
      return LaunchdarklyReactNativeClient.configureWithTimeout(configWithOverriddenDefaults, this._addUserOverrides(user), timeout);
    }
  }

  boolVariation(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.boolVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationDefaultValue(flagKey, defaultValue);
    }
  }

  intVariation(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.intVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.intVariationDefaultValue(flagKey, defaultValue);
    }
  }

  floatVariation(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.floatVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationDefaultValue(flagKey, defaultValue);
    }
  }

  stringVariation(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.stringVariation(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationDefaultValue(flagKey, defaultValue);
    }
  }

  jsonVariation(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariationNone(flagKey);
    } else if (typeof defaultValue === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationNumber(flagKey, defaultValue);
    } else if (typeof defaultValue === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationBool(flagKey, defaultValue);
    } else if (typeof defaultValue === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationString(flagKey, defaultValue);
    } else if (Array.isArray(defaultValue)) {
      return LaunchdarklyReactNativeClient.jsonVariationArray(flagKey, defaultValue);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationObject(flagKey, defaultValue);
    }
  }

  boolVariationDetail(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.boolVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationDetailDefaultValue(flagKey, defaultValue);
    }
  }

  intVariationDetail(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.intVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.intVariationDetailDefaultValue(flagKey, defaultValue);
    }
  }

  floatVariationDetail(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.floatVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationDetailDefaultValue(flagKey, defaultValue);
    }
  }

  stringVariationDetail(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.stringVariationDetail(flagKey);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationDetailDefaultValue(flagKey, defaultValue);
    }
  }

  jsonVariationDetail(flagKey, defaultValue) {
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariatioDetailNone(flagKey);
    } else if (typeof defaultValue === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailNumber(flagKey, defaultValue);
    } else if (typeof defaultValue === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailBool(flagKey, defaultValue);
    } else if (typeof defaultValue === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailString(flagKey, defaultValue);
    } else if (Array.isArray(defaultValue)) {
      return LaunchdarklyReactNativeClient.jsonVariationDetailArray(flagKey, defaultValue);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationDetailObject(flagKey, defaultValue);
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
        LaunchdarklyReactNativeClient.trackBoolMetricValue(eventName, data, metricValue);
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
    return LaunchdarklyReactNativeClient.isInitialized();
  }

  flush() {
    LaunchdarklyReactNativeClient.flush();
  }

  close() {
    LaunchdarklyReactNativeClient.close();
  }

  identify(user) {
    return LaunchdarklyReactNativeClient.identify(this._addUserOverrides(user));
  }

  _addUserOverrides(user) {
    return Object.assign({
      anonymous: false   // the iOS SDK defaults this to true
    }, user);
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

  getConnectionMode() {
    return LaunchdarklyReactNativeClient.getConnectionMode();
  }

  getLastSuccessfulConnection() {
    return LaunchdarklyReactNativeClient.getLastSuccessfulConnection();
  }

  getLastFailedConnection() {
    return LaunchdarklyReactNativeClient.getLastFailedConnection();
  }

  getLastFailure() {
    return LaunchdarklyReactNativeClient.getLastFailure();
  }
}

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

  _getEnvironment(environment) {
    return environment !== undefined ? environment : LaunchdarklyReactNativeClient.DEFAULT_ENVIRONMENT;
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

  boolVariation(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.boolVariation(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationDefaultValue(flagKey, defaultValue, env);
    }
  }

  intVariation(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.intVariation(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.intVariationDefaultValue(flagKey, defaultValue, env);
    }
  }

  floatVariation(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.floatVariation(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationDefaultValue(flagKey, defaultValue, env);
    }
  }

  stringVariation(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.stringVariation(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationDefaultValue(flagKey, defaultValue, env);
    }
  }

  jsonVariation(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariationNone(flagKey, env);
    } else if (typeof defaultValue === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationNumber(flagKey, defaultValue, env);
    } else if (typeof defaultValue === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationBool(flagKey, defaultValue, env);
    } else if (typeof defaultValue === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationString(flagKey, defaultValue, env);
    } else if (Array.isArray(defaultValue)) {
      return LaunchdarklyReactNativeClient.jsonVariationArray(flagKey, defaultValue, env);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationObject(flagKey, defaultValue, env);
    }
  }

  boolVariationDetail(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.boolVariationDetail(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.boolVariationDetailDefaultValue(flagKey, defaultValue, env);
    }
  }

  intVariationDetail(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.intVariationDetail(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.intVariationDetailDefaultValue(flagKey, defaultValue, env);
    }
  }

  floatVariationDetail(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.floatVariationDetail(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.floatVariationDetailDefaultValue(flagKey, defaultValue, env);
    }
  }

  stringVariationDetail(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.stringVariationDetail(flagKey, env);
    } else {
      return LaunchdarklyReactNativeClient.stringVariationDetailDefaultValue(flagKey, defaultValue, env);
    }
  }

  jsonVariationDetail(flagKey, defaultValue, environment) {
    const env = this._getEnvironment(environment);
    if (defaultValue == undefined) {
      return LaunchdarklyReactNativeClient.jsonVariationDetailNone(flagKey, env);
    } else if (typeof defaultValue === 'number') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailNumber(flagKey, defaultValue, env);
    } else if (typeof defaultValue === 'boolean') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailBool(flagKey, defaultValue, env);
    } else if (typeof defaultValue === 'string') {
      return LaunchdarklyReactNativeClient.jsonVariationDetailString(flagKey, defaultValue, env);
    } else if (Array.isArray(defaultValue)) {
      return LaunchdarklyReactNativeClient.jsonVariationDetailArray(flagKey, defaultValue, env);
    } else {
      // Should be an object
      return LaunchdarklyReactNativeClient.jsonVariationDetailObject(flagKey, defaultValue, env);
    }
  }

  allFlags(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.allFlags(env);
  }

  track(eventName, data, metricValue, environment) {
    const env = this._getEnvironment(environment);
    if (metricValue) {
      if (data === null || typeof data === 'undefined') {
        LaunchdarklyReactNativeClient.trackMetricValue(eventName, metricValue, env);
      } else if (typeof data === 'number') {
        LaunchdarklyReactNativeClient.trackNumberMetricValue(eventName, data, metricValue, env);
      } else if (typeof data === 'boolean') {
        LaunchdarklyReactNativeClient.trackBoolMetricValue(eventName, data, metricValue, env);
      } else if (typeof data === 'string') {
        LaunchdarklyReactNativeClient.trackStringMetricValue(eventName, data, metricValue, env);
      } else if (Array.isArray(data)) {
        LaunchdarklyReactNativeClient.trackArrayMetricValue(eventName, data, metricValue, env);
      } else {
        // should be an object
        LaunchdarklyReactNativeClient.trackObjectMetricValue(eventName, data, metricValue, env);
      }
    } else {
      if (data === null || typeof data === 'undefined') {
        LaunchdarklyReactNativeClient.track(eventName, env);
      } else if (typeof data === 'number') {
        LaunchdarklyReactNativeClient.trackNumber(eventName, data, env);
      } else if (typeof data === 'boolean') {
        LaunchdarklyReactNativeClient.trackBool(eventName, data, env);
      } else if (typeof data === 'string') {
        LaunchdarklyReactNativeClient.trackString(eventName, data, env);
      } else if (Array.isArray(data)) {
        LaunchdarklyReactNativeClient.trackArray(eventName, data, env);
      } else {
        // should be an object
        LaunchdarklyReactNativeClient.trackObject(eventName, data, env);
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

  isInitialized(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.isInitialized(env);
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
    const listenerId = changedFlags.listenerId;
    for (const [key, value] of Object.entries(this.allFlagsListeners)) {
      if (key == listenerId) {
        key(flagKeys);
      }
    }
  }

  _connectionModeUpdateListener(connectionStatus) {
    const connectionMode = connectionStatus.connectionMode;
    const listenerId = connectionStatus.listenerId;
    for (const [key, value] of Object.entries(this.connectionModeListeners)) {
      if (key == listenerId) {
        key(connectionMode);
      }
    }
  }

  _envConcat(env, flagKey) {
    return env.concat(";", flagKey)
  }

  registerFeatureFlagListener(flagKey, callback, environment) {
    if (typeof callback !== "function") {
      return;
    }
    const env = this._getEnvironment(environment);
    const multiFlagKey = this._envConcat(env, flagKey);

    if (this.flagListeners.hasOwnProperty(multiFlagKey)) {
      this.flagListeners[multiFlagKey].push(callback);
    } else {
      this.flagListeners[multiFlagKey] = [callback];

      LaunchdarklyReactNativeClient.registerFeatureFlagListener(flagKey, env);
    }
  }

  unregisterFeatureFlagListener(flagKey, callback, environment) {
    const env = this._getEnvironment(environment);
    const multiFlagKey = this._envConcat(env, flagKey);
    if (!this.flagListeners.hasOwnProperty(multiFlagKey)) {
      return;
    }

    this.flagListeners[multiFlagKey] =
      this.flagListeners[multiFlagKey].filter(listener => listener != callback);

    if (this.flagListeners[multiFlagKey].length == 0) {
      LaunchdarklyReactNativeClient.unregisterFeatureFlagListener(flagKey, env);
      delete this.flagListeners[multiFlagKey];
    }
  }

  registerCurrentConnectionModeListener(listenerId, callback, environment) {
    if (typeof callback !== "function") {
      return;
    }
    const env = this._getEnvironment(environment);
    const multiListenerId = this._envConcat(env, flagKey);

    this.connectionModeListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerCurrentConnectionModeListener(listenerId, env);
  }

  unregisterCurrentConnectionModeListener(listenerId, environment) {
    const env = this._getEnvironment(environment);
    const multiListenerId = this._envConcat(env, flagKey);
    if (!this.connectionModeListeners.hasOwnProperty(multiListenerId)) {
      return;
    }

    LaunchdarklyReactNativeClient.unregisterCurrentConnectionModeListener(listenerId, env);
    delete this.connectionModeListeners[multiListenerId];
  }

  registerAllFlagsListener(listenerId, callback, environment) {
    if (typeof callback !== "function") {
      return;
    }
    const env = this._getEnvironment(environment);
    const multiListenerId = this._envConcat(env, flagKey);
    
    this.allFlagsListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerAllFlagsListener(listenerId, env);
  }

  unregisterAllFlagsListener(listenerId, environment) {
    const env = this._getEnvironment(environment);
    const multiListenerId = this._envConcat(env, flagKey);
    if (!this.allFlagsListeners.hasOwnProperty(multiListenerId)) {
      return;
    }

    LaunchdarklyReactNativeClient.unregisterAllFlagsListener(listenerId, env);
    delete this.allFlagsListeners[multiListenerId];
  }

  getConnectionMode(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.getConnectionMode(env);
  }

  getLastSuccessfulConnection(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.getLastSuccessfulConnection(env);
  }

  getLastFailedConnection(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.getLastFailedConnection(env);
  }

  getLastFailure(environment) {
    const env = this._getEnvironment(environment);
    return LaunchdarklyReactNativeClient.getLastFailure(env);
  }
}

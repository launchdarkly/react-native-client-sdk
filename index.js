import { NativeModules, NativeEventEmitter } from 'react-native';
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
    return LaunchdarklyReactNativeClient.isInitialized("default")
      .then(
        ignored => {
          throw new Error('LaunchDarkly SDK already initialized');
        },
        () => {
          const configWithOverriddenDefaults = Object.assign({
            backgroundPollingIntervalMillis: 3600000, // the iOS SDK defaults this to 900000
            disableBackgroundUpdating: false,         // the iOS SDK defaults this to true
            pollUri: 'https://clientsdk.launchdarkly.com',
            wrapperName: 'react-native-client-sdk',
            wrapperVersion: this.getVersion()
          }, config);

          if (timeout == undefined) {
            return LaunchdarklyReactNativeClient.configure(configWithOverriddenDefaults, user);
          } else {
            return LaunchdarklyReactNativeClient.configureWithTimeout(configWithOverriddenDefaults, user, timeout);
          }
        }
      );
  }

  _validateDefault(defaultType, defaultValue, validator) {
    if (typeof defaultValue !== defaultType ||
        (typeof validator === 'function' && !validator(defaultValue))) {
      return Promise.reject(new Error('Missing or invalid defaultValue for variation call'));
    }
    return Promise.resolve();
  }

  _normalizeEnv(environment) {
    if (typeof environment !== 'string') {
      return 'default';
    }
    return environment;
  }

  boolVariation(flagKey, defaultValue, environment) {
    return this._validateDefault('boolean', defaultValue)
      .then(() => LaunchdarklyReactNativeClient.boolVariation(flagKey, defaultValue, this._normalizeEnv(environment)));
  }

  numberVariation(flagKey, defaultValue, environment) {
    return this._validateDefault('number', defaultValue, val => !isNaN(val))
      .then(() => LaunchdarklyReactNativeClient.numberVariation(flagKey, defaultValue, this._normalizeEnv(environment)));
  }

  stringVariation(flagKey, defaultValue, environment) {
    if (defaultValue != null && typeof defaultValue !== 'string') {
      return Promise.reject(new Error('Missing or invalid defaultValue for variation call'));
    } else if (defaultValue === undefined) {
      defaultValue = null;
    }
    return LaunchdarklyReactNativeClient.stringVariation(flagKey, defaultValue, this._normalizeEnv(environment));
  }

  jsonVariation(flagKey, defaultValue, environment) {
    const env = environment !== undefined ? environment : "default";
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
    return this._validateDefault('boolean', defaultValue)
      .then(() => LaunchdarklyReactNativeClient.boolVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment)));
  }

  numberVariationDetail(flagKey, defaultValue, environment) {
    return this._validateDefault('number', defaultValue, val => !isNaN(val))
      .then(() => LaunchdarklyReactNativeClient.numberVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment)));
  }

  stringVariationDetail(flagKey, defaultValue, environment) {
    if (defaultValue != null && typeof defaultValue !== 'string') {
      return Promise.reject(new Error('Missing or invalid defaultValue for variation call'));
    } else if (defaultValue === undefined) {
      defaultValue = null;
    }
    return LaunchdarklyReactNativeClient.stringVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment));
  }

  jsonVariationDetail(flagKey, defaultValue, environment) {
    const env = environment !== undefined ? environment : "default";
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
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.allFlags(env);
  }

  track(eventName, data, metricValue, environment) {
    const env = environment !== undefined ? environment : "default";
    if (typeof metricValue === 'number') {
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
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.isInitialized(env);
  }
  
  isInitializedSafe(environment) {
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.isInitializedSafe(env);
  }

  flush() {
    LaunchdarklyReactNativeClient.flush();
  }

  close() {
    LaunchdarklyReactNativeClient.close();
  }

  identify(user) {
    return LaunchdarklyReactNativeClient.identify(user);
  }

  alias(user, previousUser, environment) {
    const env = environment !== undefined ? environment : "default";
    LaunchdarklyReactNativeClient.alias(env, user, previousUser);
  }

  _flagUpdateListener(changedFlag) {
    const flagKey = changedFlag.flagKey;
    const listenerId = changedFlag.listenerId;
    if (this.flagListeners.hasOwnProperty(listenerId)) {
      let listeners = this.flagListeners[listenerId];
      for (const listener of listeners) {
        listener(flagKey);
      }
    }
  }

  _allFlagsUpdateListener(changedFlags) {
    const flagKeys = changedFlags.flagKeys;
    const listenerId = changedFlags.listenerId;
    if (this.allFlagsListeners.hasOwnProperty(listenerId)) {
      this.allFlagsListeners[listenerId](flagKeys);
    }
  }

  _connectionModeUpdateListener(connectionStatus) {
    const connectionMode = connectionStatus.connectionMode;
    const listenerId = connectionStatus.listenerId;
    if (this.connectionModeListeners.hasOwnProperty(listenerId)) {
      this.connectionModeListeners[listenerId](connectionMode);
    }
  }

  _envConcat(env, flagKey) {
    return env.concat(";", flagKey)
  }

  registerFeatureFlagListener(flagKey, callback, environment) {
    if (typeof callback !== "function") {
      return;
    }
    const env = environment !== undefined ? environment : "default";
    const multiFlagKey = this._envConcat(env, flagKey);

    if (this.flagListeners.hasOwnProperty(multiFlagKey)) {
      this.flagListeners[multiFlagKey].push(callback);
    } else {
      this.flagListeners[multiFlagKey] = [callback];

      LaunchdarklyReactNativeClient.registerFeatureFlagListener(flagKey, env);
    }
  }

  unregisterFeatureFlagListener(flagKey, callback, environment) {
    const env = environment !== undefined ? environment : "default";
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
    const env = environment !== undefined ? environment : "default";
    const multiListenerId = this._envConcat(env, listenerId);

    this.connectionModeListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerCurrentConnectionModeListener(listenerId, env);
  }

  unregisterCurrentConnectionModeListener(listenerId, environment) {
    const env = environment !== undefined ? environment : "default";
    const multiListenerId = this._envConcat(env, listenerId);
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
    const env = environment !== undefined ? environment : "default";
    const multiListenerId = this._envConcat(env, listenerId);
    
    this.allFlagsListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerAllFlagsListener(listenerId, env);
  }

  unregisterAllFlagsListener(listenerId, environment) {
    const env = environment !== undefined ? environment : "default";
    const multiListenerId = this._envConcat(env, listenerId);
    if (!this.allFlagsListeners.hasOwnProperty(multiListenerId)) {
      return;
    }

    LaunchdarklyReactNativeClient.unregisterAllFlagsListener(listenerId, env);
    delete this.allFlagsListeners[multiListenerId];
  }

  getConnectionMode(environment) {
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.getConnectionMode(env);
  }

  getLastSuccessfulConnection(environment) {
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.getLastSuccessfulConnection(env);
  }

  getLastFailedConnection(environment) {
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.getLastFailedConnection(env);
  }

  getLastFailure(environment) {
    const env = environment !== undefined ? environment : "default";
    return LaunchdarklyReactNativeClient.getLastFailure(env);
  }
}

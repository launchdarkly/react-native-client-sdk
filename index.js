import { NativeModules, NativeEventEmitter } from 'react-native';
import { version } from './package.json';

let LaunchdarklyReactNativeClient = NativeModules.LaunchdarklyReactNativeClient;

export default class LDClient {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(LaunchdarklyReactNativeClient);
    this.flagListeners = {};
    this.allFlagsListeners = {};
    this.connectionModeListeners = {};
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.FLAG_PREFIX, (body) => this._flagUpdateListener(body));
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.ALL_FLAGS_PREFIX, (body) =>
      this._allFlagsUpdateListener(body),
    );
    this.eventEmitter.addListener(LaunchdarklyReactNativeClient.CONNECTION_MODE_PREFIX, (body) =>
      this._connectionModeUpdateListener(body),
    );
  }

  getVersion() {
    return String(version);
  }

  configure(config, user, timeout) {
    return LaunchdarklyReactNativeClient.isInitialized('default').then(
      (ignored) => {
        throw new Error('LaunchDarkly SDK already initialized');
      },
      () => {
        const configWithOverriddenDefaults = Object.assign(
          {
            backgroundPollingIntervalMillis: 3600000, // the iOS SDK defaults this to 900000
            disableBackgroundUpdating: false, // the iOS SDK defaults this to true
            pollUri: 'https://clientsdk.launchdarkly.com',
            wrapperName: 'react-native-client-sdk',
            wrapperVersion: this.getVersion(),
          },
          config,
        );

        if (timeout == undefined) {
          return LaunchdarklyReactNativeClient.configure(configWithOverriddenDefaults, user);
        } else {
          return LaunchdarklyReactNativeClient.configureWithTimeout(configWithOverriddenDefaults, user, timeout);
        }
      },
    );
  }

  _validateDefault(defaultType, defaultValue, validator) {
    if (typeof defaultValue !== defaultType || (typeof validator === 'function' && !validator(defaultValue))) {
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
    return this._validateDefault('boolean', defaultValue).then(() =>
      LaunchdarklyReactNativeClient.boolVariation(flagKey, defaultValue, this._normalizeEnv(environment)),
    );
  }

  numberVariation(flagKey, defaultValue, environment) {
    return this._validateDefault('number', defaultValue, (val) => !isNaN(val)).then(() =>
      LaunchdarklyReactNativeClient.numberVariation(flagKey, defaultValue, this._normalizeEnv(environment)),
    );
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
    if (defaultValue === undefined) {
      defaultValue = null;
    }
    return LaunchdarklyReactNativeClient.jsonVariation(flagKey, defaultValue, this._normalizeEnv(environment));
  }

  boolVariationDetail(flagKey, defaultValue, environment) {
    return this._validateDefault('boolean', defaultValue).then(() =>
      LaunchdarklyReactNativeClient.boolVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment)),
    );
  }

  numberVariationDetail(flagKey, defaultValue, environment) {
    return this._validateDefault('number', defaultValue, (val) => !isNaN(val)).then(() =>
      LaunchdarklyReactNativeClient.numberVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment)),
    );
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
    if (defaultValue === undefined) {
      defaultValue = null;
    }
    return LaunchdarklyReactNativeClient.jsonVariationDetail(flagKey, defaultValue, this._normalizeEnv(environment));
  }

  allFlags(environment) {
    return LaunchdarklyReactNativeClient.allFlags(this._normalizeEnv(environment));
  }

  track(eventName, data, metricValue, environment) {
    if (data === undefined) {
      data = null;
    }
    if (typeof metricValue === 'number') {
      LaunchdarklyReactNativeClient.trackMetricValue(eventName, data, metricValue, this._normalizeEnv(environment));
    } else {
      LaunchdarklyReactNativeClient.trackData(eventName, data, this._normalizeEnv(environment));
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
    return LaunchdarklyReactNativeClient.isInitialized(this._normalizeEnv(environment));
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
    LaunchdarklyReactNativeClient.alias(this._normalizeEnv(environment), user, previousUser);
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
    return env.concat(';', flagKey);
  }

  registerFeatureFlagListener(flagKey, callback, environment) {
    if (typeof callback !== 'function') {
      return;
    }
    const env = this._normalizeEnv(environment);
    const multiFlagKey = this._envConcat(env, flagKey);

    if (this.flagListeners.hasOwnProperty(multiFlagKey)) {
      this.flagListeners[multiFlagKey].push(callback);
    } else {
      this.flagListeners[multiFlagKey] = [callback];

      LaunchdarklyReactNativeClient.registerFeatureFlagListener(flagKey, env);
    }
  }

  unregisterFeatureFlagListener(flagKey, callback, environment) {
    const env = this._normalizeEnv(environment);
    const multiFlagKey = this._envConcat(env, flagKey);
    if (!this.flagListeners.hasOwnProperty(multiFlagKey)) {
      return;
    }

    this.flagListeners[multiFlagKey] = this.flagListeners[multiFlagKey].filter((listener) => listener != callback);

    if (this.flagListeners[multiFlagKey].length == 0) {
      LaunchdarklyReactNativeClient.unregisterFeatureFlagListener(flagKey, env);
      delete this.flagListeners[multiFlagKey];
    }
  }

  registerCurrentConnectionModeListener(listenerId, callback, environment) {
    if (typeof callback !== 'function') {
      return;
    }
    const env = this._normalizeEnv(environment);
    const multiListenerId = this._envConcat(env, listenerId);

    this.connectionModeListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerCurrentConnectionModeListener(listenerId, env);
  }

  unregisterCurrentConnectionModeListener(listenerId, environment) {
    const env = this._normalizeEnv(environment);
    const multiListenerId = this._envConcat(env, listenerId);
    if (!this.connectionModeListeners.hasOwnProperty(multiListenerId)) {
      return;
    }

    LaunchdarklyReactNativeClient.unregisterCurrentConnectionModeListener(listenerId, env);
    delete this.connectionModeListeners[multiListenerId];
  }

  registerAllFlagsListener(listenerId, callback, environment) {
    if (typeof callback !== 'function') {
      return;
    }
    const env = this._normalizeEnv(environment);
    const multiListenerId = this._envConcat(env, listenerId);

    this.allFlagsListeners[multiListenerId] = callback;
    LaunchdarklyReactNativeClient.registerAllFlagsListener(listenerId, env);
  }

  unregisterAllFlagsListener(listenerId, environment) {
    const env = this._normalizeEnv(environment);
    const multiListenerId = this._envConcat(env, listenerId);
    if (!this.allFlagsListeners.hasOwnProperty(multiListenerId)) {
      return;
    }

    LaunchdarklyReactNativeClient.unregisterAllFlagsListener(listenerId, env);
    delete this.allFlagsListeners[multiListenerId];
  }

  getConnectionMode(environment) {
    return LaunchdarklyReactNativeClient.getConnectionMode(this._normalizeEnv(environment));
  }

  getLastSuccessfulConnection(environment) {
    return LaunchdarklyReactNativeClient.getLastSuccessfulConnection(this._normalizeEnv(environment));
  }

  getLastFailedConnection(environment) {
    return LaunchdarklyReactNativeClient.getLastFailedConnection(this._normalizeEnv(environment));
  }

  getLastFailure(environment) {
    return LaunchdarklyReactNativeClient.getLastFailure(this._normalizeEnv(environment));
  }
}

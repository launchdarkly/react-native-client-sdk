package com.launchdarkly.reactnative;

import android.app.Application;
import android.net.Uri;

import androidx.arch.core.util.Function;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.launchdarkly.sdk.ArrayBuilder;
import com.launchdarkly.sdk.EvaluationDetail;
import com.launchdarkly.sdk.EvaluationReason;
import com.launchdarkly.sdk.LDUser;
import com.launchdarkly.sdk.LDValue;
import com.launchdarkly.sdk.ObjectBuilder;
import com.launchdarkly.sdk.UserAttribute;
import com.launchdarkly.sdk.android.ConnectionInformation;
import com.launchdarkly.sdk.android.FeatureFlagChangeListener;
import com.launchdarkly.sdk.android.LDAllFlagsListener;
import com.launchdarkly.sdk.android.LDClient;
import com.launchdarkly.sdk.android.LDConfig;
import com.launchdarkly.sdk.android.LDFailure;
import com.launchdarkly.sdk.android.LDStatusListener;
import com.launchdarkly.sdk.android.LaunchDarklyException;

import org.jetbrains.annotations.NotNull;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import timber.log.Timber;

public class LaunchdarklyReactNativeClientModule extends ReactContextBaseJavaModule {

    enum ConfigMapping {
        CONFIG_MOBILE_KEY("mobileKey", ConfigEntryType.String),
        CONFIG_BASE_URI("pollUri", ConfigEntryType.Uri),
        CONFIG_EVENTS_URI("eventsUri", ConfigEntryType.Uri),
        CONFIG_STREAM_URI("streamUri", ConfigEntryType.Uri),
        CONFIG_EVENTS_CAPACITY("eventsCapacity", ConfigEntryType.Integer),
        CONFIG_EVENTS_FLUSH_INTERVAL("eventsFlushIntervalMillis", ConfigEntryType.Integer),
        CONFIG_CONNECTION_TIMEOUT("connectionTimeoutMillis", ConfigEntryType.Integer),
        CONFIG_POLLING_INTERVAL("pollingIntervalMillis", ConfigEntryType.Integer),
        CONFIG_BACKGROUND_POLLING_INTERVAL("backgroundPollingIntervalMillis", ConfigEntryType.Integer),
        CONFIG_USE_REPORT("useReport", ConfigEntryType.Boolean),
        CONFIG_STREAM("stream", ConfigEntryType.Boolean),
        CONFIG_DISABLE_BACKGROUND_UPDATING("disableBackgroundUpdating", ConfigEntryType.Boolean),
        CONFIG_OFFLINE("offline", ConfigEntryType.Boolean),
        CONFIG_PRIVATE_ATTRIBUTES("privateAttributeNames", ConfigEntryType.UserAttributes, "privateAttributes"),
        CONFIG_EVALUATION_REASONS("evaluationReasons", ConfigEntryType.Boolean),
        CONFIG_WRAPPER_NAME("wrapperName", ConfigEntryType.String),
        CONFIG_WRAPPER_VERSION("wrapperVersion", ConfigEntryType.String),
        CONFIG_MAX_CACHED_USERS("maxCachedUsers", ConfigEntryType.Integer),
        CONFIG_DIAGNOSTIC_OPT_OUT("diagnosticOptOut", ConfigEntryType.Boolean),
        CONFIG_DIAGNOSTIC_RECORDING_INTERVAL("diagnosticRecordingIntervalMillis", ConfigEntryType.Integer),
        CONFIG_SECONDARY_MOBILE_KEYS("secondaryMobileKeys", ConfigEntryType.Map),
        CONFIG_AUTO_ALIASING_OPT_OUT("autoAliasingOptOut", ConfigEntryType.Boolean),
        CONFIG_INLINE_USERS_IN_EVENTS("inlineUsersInEvents", ConfigEntryType.Boolean);

        final String key;
        final ConfigEntryType type;
        private final Method setter;

        ConfigMapping(String key, ConfigEntryType type) {
            this(key, type, key);
        }

        ConfigMapping(String key, ConfigEntryType type, String setterName) {
            this.key = key;
            this.type = type;
            this.setter = findSetter(LDConfig.Builder.class, setterName);
        }

        void loadFromMap(ReadableMap map, LDConfig.Builder builder) {
            if (map.hasKey(key) && map.getType(key).equals(type.getReadableType())) {
                try {
                    setter.invoke(builder, type.getFromMap(map, key));
                } catch (IllegalAccessException | InvocationTargetException e) {
                    Timber.w(e);
                }
            }
        }
    }

    enum UserConfigMapping {
        USER_ANONYMOUS("anonymous", ConfigEntryType.Boolean, "anonymous", null),
        USER_IP("ip", ConfigEntryType.String, "ip", "privateIp"),
        USER_EMAIL("email", ConfigEntryType.String, "email", "privateEmail"),
        USER_FIRST_NAME("firstName", ConfigEntryType.String, "firstName", "privateFirstName"),
        USER_LAST_NAME("lastName", ConfigEntryType.String, "lastName", "privateLastName"),
        USER_NAME("name", ConfigEntryType.String, "name", "privateName"),
        USER_SECONDARY("secondary", ConfigEntryType.String, "secondary", "privateSecondary"),
        USER_AVATAR("avatar", ConfigEntryType.String, "avatar", "privateAvatar"),
        USER_COUNTRY("country", ConfigEntryType.String, "country", "privateCountry");

        final String key;
        final ConfigEntryType type;
        private final Method setter;
        private final Method privateSetter;

        UserConfigMapping(String key, ConfigEntryType type, String setterName, String privateSetterName) {
            this.key = key;
            this.type = type;
            this.setter = findSetter(LDUser.Builder.class, setterName);
            this.privateSetter = findSetter(LDUser.Builder.class, privateSetterName);
        }

        void loadFromMap(ReadableMap map, LDUser.Builder builder, Set<String> privateAttrs) {
            if (map.hasKey(key) && map.getType(key).equals(type.getReadableType())) {
                try {
                    if (privateAttrs.contains(key) && privateSetter != null) {
                        privateSetter.invoke(builder, type.getFromMap(map, key));
                    } else {
                        setter.invoke(builder, type.getFromMap(map, key));
                    }
                } catch (IllegalAccessException | InvocationTargetException e) {
                    Timber.w(e);
                }
            }
        }
    }

    private final Map<String, FeatureFlagChangeListener> listeners = new HashMap<>();
    private final Map<String, LDStatusListener> connectionModeListeners = new HashMap<>();
    private final Map<String, LDAllFlagsListener> allFlagsListeners = new HashMap<>();

    private static final Gson gson = new Gson();
    private static boolean debugLoggingStarted = false;

    public LaunchdarklyReactNativeClientModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * Called automatically by the React Native bridging layer. Returned String is the name that
     * the module can be looked up from the NativeModules object.
     *
     * @return Name for the module in JS
     */
    @SuppressWarnings("SameReturnValue")
    @Override
    public @NotNull String getName() {
        return "LaunchdarklyReactNativeClient";
    }

    private static final String ERROR_INIT = "E_INITIALIZE";
    private static final String ERROR_IDENTIFY = "E_IDENTIFY";
    private static final String ERROR_CLOSE = "E_CLOSE";
    private static final String ERROR_UNKNOWN = "E_UNKNOWN";

    private static final String FLAG_PREFIX = "LaunchDarkly-Flag-";
    private static final String ALL_FLAGS_PREFIX = "LaunchDarkly-All-Flags-";
    private static final String CONNECTION_MODE_PREFIX = "LaunchDarkly-Connection-Mode-";

    /**
     * Called automatically by the React Native bridging layer to associate constants with the
     * object used to call into native modules.
     *
     * @return A mapping of strings to values that will be included in the JS object.
     */
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("FLAG_PREFIX", FLAG_PREFIX);
        constants.put("ALL_FLAGS_PREFIX", ALL_FLAGS_PREFIX);
        constants.put("CONNECTION_MODE_PREFIX", CONNECTION_MODE_PREFIX);
        return constants;
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void configure(ReadableMap config, ReadableMap user, final Promise promise) {
        internalConfigure(config, user, null, promise);
    }

    @ReactMethod
    public void configureWithTimeout(ReadableMap config, ReadableMap user, Integer timeout, final Promise promise) {
        internalConfigure(config, user, timeout, promise);
    }

    private void internalConfigure(ReadableMap config, ReadableMap user, final Integer timeout, final Promise promise) {
        if (!debugLoggingStarted
                && config.hasKey("debugMode")
                && config.getType("debugMode").equals(ReadableType.Boolean)
                && config.getBoolean("debugMode")) {
            Timber.plant(new Timber.DebugTree());
            LaunchdarklyReactNativeClientModule.debugLoggingStarted = true;
        }

        try {
            LDClient.get();
            promise.reject(ERROR_INIT, "Client was already initialized");
            return;
        } catch (LaunchDarklyException e) {
            // This exception indicates that the SDK has not been initialized yet
        }

        final LDConfig.Builder ldConfigBuilder = configBuild(config);
        final LDUser ldUser = userBuild(user).build();

        if (config.hasKey("allUserAttributesPrivate")
            && config.getType("allUserAttributesPrivate").equals(ConfigEntryType.Boolean.getReadableType()) 
            && config.getBoolean("allUserAttributesPrivate")) {
                ldConfigBuilder.allAttributesPrivate();
        }

        final Application application = (Application) getReactApplicationContext().getApplicationContext();

        if (application != null) {
            Thread background = new Thread(new Runnable() {
                @Override
                public void run() {
                    if (timeout != null) {
                        LDClient.init(application, ldConfigBuilder.build(), ldUser, timeout);
                    } else {
                        try {
                            LDClient.init(application, ldConfigBuilder.build(), ldUser).get();
                        } catch (ExecutionException | InterruptedException e) {
                            Timber.e(e, "Exception during Client initialization");
                        }
                    }
                    promise.resolve(null);
                }
            });

            background.start();
        } else {
            Timber.e("Couldn't initialize the LaunchDarkly module because the application was null");
            promise.reject(ERROR_INIT, "Couldn't acquire application context");
        }
    }

    private LDConfig.Builder configBuild(ReadableMap options) {
        LDConfig.Builder builder = new LDConfig.Builder();

        for (ConfigMapping entry : ConfigMapping.values()) {
            entry.loadFromMap(options, builder);
        }

        return builder;
    }

    private LDUser.Builder userBuild(ReadableMap options) {
        String userKey = null;
        if (options.hasKey("key") && options.getType("key") == ReadableType.String) {
            userKey = options.getString("key");
        }

        LDUser.Builder userBuilder = new LDUser.Builder(userKey);
        Set<String> privateAttrs = new HashSet<>();

        if (options.hasKey("privateAttributeNames") &&
                options.getType("privateAttributeNames") == ReadableType.Array) {
            ReadableArray privateAttrsArray = options.getArray("privateAttributeNames");
            for (int i = 0; i < privateAttrsArray.size(); i++) {
                if (privateAttrsArray.getType(i) == ReadableType.String) {
                    privateAttrs.add(privateAttrsArray.getString(i));
                }
            }
        }

        for (UserConfigMapping entry : UserConfigMapping.values()) {
            entry.loadFromMap(options, userBuilder, privateAttrs);
        }

        if (options.hasKey("custom") && options.getType("custom") == ReadableType.Map) {
            LDValue custom = toLDValue(options.getMap("custom"));
            for (String customKey : custom.keys()) {
                if (privateAttrs.contains(customKey)) {
                    userBuilder.privateCustom(customKey, custom.get(customKey));
                } else {
                    userBuilder.custom(customKey, custom.get(customKey));
                }
            }
        }

        return userBuilder;
    }

    @ReactMethod
    public void boolVariation(String flagKey, boolean defaultValue, String environment, Promise promise) {
        variation(LDClient::boolVariation, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void numberVariation(String flagKey, double defaultValue, String environment, Promise promise) {
        variation(LDClient::doubleVariation, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void stringVariation(String flagKey, String defaultValue, String environment, Promise promise) {
        variation(LDClient::stringVariation, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void jsonVariationNone(String flagKey, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, LDValue.ofNull(), environment, promise);
    }

    @ReactMethod
    public void jsonVariationNumber(String flagKey, double defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationBool(String flagKey, boolean defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationString(String flagKey, String defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationArray(String flagKey, ReadableArray defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationObject(String flagKey, ReadableMap defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
    }

    interface EvalCall<T> {
        T call(LDClient client, String flagKey, T defaultValue);
    }

    private <T> void variation(EvalCall<T> eval, Function<T, LDValue> transform,
                               String flagKey, T defaultValue, String environment, Promise promise) {
        try {
            promise.resolve(ldValueToBridge(transform.apply(eval.call(LDClient.getForMobileKey(environment), flagKey, defaultValue))));
        } catch (Exception e) {
            promise.resolve(ldValueToBridge(transform.apply(defaultValue)));
        }
    }

    @ReactMethod
    public void boolVariationDetail(String flagKey, boolean defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::boolVariationDetail, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void numberVariationDetail(String flagKey, double defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::doubleVariationDetail, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void stringVariationDetail(String flagKey, String defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::stringVariationDetail, LDValue::of, flagKey, defaultValue, environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailNone(String flagKey, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, LDValue.ofNull(), environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailNumber(String flagKey, double defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailBool(String flagKey, boolean defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailString(String flagKey, String defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, LDValue.of(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailArray(String flagKey, ReadableArray defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
    }

    @ReactMethod
    public void jsonVariationDetailObject(String flagKey, ReadableMap defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
    }

    interface EvalDetailCall<T> {
        EvaluationDetail<T> call(LDClient client, String flagKey, T defaultValue);
    }

    private <T> void detailVariation(EvalDetailCall<T> eval, Function<T, LDValue> transform,
                                     String flagKey, T defaultValue, String environment, Promise promise) {
        try {
            LDClient client = LDClient.getForMobileKey(environment);
            EvaluationDetail<T> detail = eval.call(client, flagKey, defaultValue);
            ObjectBuilder resultBuilder = objectBuilderFromDetail(detail);
            resultBuilder.put("value", transform.apply(detail.getValue()));
            promise.resolve(ldValueToBridge(resultBuilder.build()));
        } catch (Exception e) {
            ObjectBuilder resultBuilder = LDValue.buildObject();
            resultBuilder.put("kind", EvaluationReason.Kind.ERROR.name());
            resultBuilder.put("errorKind", EvaluationReason.ErrorKind.EXCEPTION.name());
            resultBuilder.put("value", transform.apply(defaultValue));
            promise.resolve(ldValueToBridge(resultBuilder.build()));
        }
    }

    private ObjectBuilder objectBuilderFromDetail(EvaluationDetail<?> detail) {
        ObjectBuilder resultMap = LDValue.buildObject();
        if (!detail.isDefaultValue()) {
            resultMap.put("variationIndex", detail.getVariationIndex());
        }
        EvaluationReason reason = detail.getReason();
        ObjectBuilder reasonMap = LDValue.buildObject();
        reasonMap.put("kind", reason.getKind().name());
        switch (reason.getKind()) {
            case RULE_MATCH:
                reasonMap.put("ruleIndex", reason.getRuleIndex());
                if (reason.getRuleId() != null) {
                    reasonMap.put("ruleId", reason.getRuleId());
                }
                break;
            case PREREQUISITE_FAILED: reasonMap.put("prerequisiteKey", reason.getPrerequisiteKey()); break;
            case ERROR: reasonMap.put("errorKind", reason.getErrorKind().name()); break;
            default: break;
        }
        resultMap.put("reason", reasonMap.build());
        return resultMap;
    }

    @ReactMethod
    public void allFlags(String environment, Promise promise) {
        try {
            LDClient.get();
        } catch (LaunchDarklyException e) {
            promise.reject(ERROR_INIT, "SDK has been not configured");
            return;
        }
        
        try {
            ObjectBuilder resultBuilder = LDValue.buildObject();
            for (Map.Entry<String, LDValue> entry : LDClient.getForMobileKey(environment).allFlags().entrySet()) {
                resultBuilder.put(entry.getKey(), entry.getValue());
            }
            promise.resolve(ldValueToBridge(resultBuilder.build()));
        } catch (LaunchDarklyException e) {
            // Since we confirmed the SDK has been configured, this exception should only be thrown if the env doesn't exist
            promise.reject(ERROR_UNKNOWN, "SDK not configured with requested environment");
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, "Unknown exception in allFlags");
            Timber.w(e);
        }
    }

    @ReactMethod
    public void trackNumber(String eventName, double data, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), null);
    }

    @ReactMethod
    public void trackBool(String eventName, boolean data, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), null);
    }

    @ReactMethod
    public void trackString(String eventName, String data, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), null);
    }

    @ReactMethod
    public void trackArray(String eventName, ReadableArray data, String environment) {
        trackSafe(environment, eventName, toLDValue(data), null);
    }

    @ReactMethod
    public void trackObject(String eventName, ReadableMap data, String environment) {
        trackSafe(environment, eventName, toLDValue(data), null);
    }

    @ReactMethod
    public void track(String eventName, String environment) {
        trackSafe(environment, eventName, LDValue.ofNull(), null);
    }

    @ReactMethod
    public void trackNumberMetricValue(String eventName, double data, double metricValue, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), metricValue);
    }

    @ReactMethod
    public void trackBoolMetricValue(String eventName, boolean data, double metricValue, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), metricValue);
    }

    @ReactMethod
    public void trackStringMetricValue(String eventName, String data, double metricValue, String environment) {
        trackSafe(environment, eventName, LDValue.of(data), metricValue);
    }

    @ReactMethod
    public void trackArrayMetricValue(String eventName, ReadableArray data, double metricValue, String environment) {
        trackSafe(environment, eventName, toLDValue(data), metricValue);
    }

    @ReactMethod
    public void trackObjectMetricValue(String eventName, ReadableMap data, double metricValue, String environment) {
        trackSafe(environment, eventName, toLDValue(data), metricValue);
    }

    @ReactMethod
    public void trackMetricValue(String eventName, double metricValue, String environment) {
        trackSafe(environment, eventName, LDValue.ofNull(), metricValue);
    }

    private void trackSafe(String environment, String eventName, LDValue value, Double metricValue) {
        try {
            LDClient instance = LDClient.getForMobileKey(environment);
            if (metricValue != null) {
                instance.trackMetric(eventName, value, metricValue);
            } else {
                instance.trackData(eventName, value);
            }
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void setOffline(Promise promise) {
        try {
            LDClient.get().setOffline();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void isOffline(Promise promise) {
        try {
            boolean result = LDClient.get().isOffline();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void setOnline(Promise promise) {
        try {
            LDClient.get().setOnline();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void isInitialized(String environment, Promise promise) {
        try {
            boolean result = LDClient.getForMobileKey(environment).isInitialized();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }
    
    @ReactMethod
    public void isInitializedSafe(String environment, Promise promise) {
        try {
            boolean result = LDClient.getForMobileKey(environment).isInitialized();
            promise.resolve(result);
        } catch (Exception e) {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void flush() {
        try {
            LDClient.get().flush();
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void close(Promise promise) {
        try {
            LDClient.get().close();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(ERROR_CLOSE, e);
        }
    }

    @ReactMethod
    public void identify(ReadableMap options, final Promise promise) {
        final LDUser user = userBuild(options).build();
        Thread background = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    LDClient.get().identify(user).get();
                    promise.resolve(null);
                } catch (InterruptedException e) {
                    Timber.w(e);
                    promise.reject(ERROR_IDENTIFY, "Identify Interrupted");
                } catch (ExecutionException e) {
                    Timber.w(e);
                    promise.reject(ERROR_IDENTIFY, "Exception while executing identify");
                } catch (Exception e) {
                    Timber.w(e);
                    promise.reject(ERROR_UNKNOWN, e);
                }
            }
        });
        background.start();
    }

    @ReactMethod
    public void alias(String environment, ReadableMap user, ReadableMap previousUser) {
        try {
            LDClient.getForMobileKey(environment).alias(userBuild(user).build(), userBuild(previousUser).build());
        } catch (LaunchDarklyException e) {
            Timber.w("LaunchDarkly alias called with invalid environment");
        }
    }

    @ReactMethod
    public void getConnectionMode(String environment, Promise promise) {
        try {
            promise.resolve(LDClient.getForMobileKey(environment).getConnectionInformation().getConnectionMode().name());
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void getLastSuccessfulConnection(String environment, Promise promise) {
        try {
            promise.resolve(LDClient.getForMobileKey(environment).getConnectionInformation().getLastSuccessfulConnection().intValue());
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void getLastFailedConnection(String environment, Promise promise) {
        try {
            promise.resolve(LDClient.getForMobileKey(environment).getConnectionInformation().getLastFailedConnection().intValue());
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void getLastFailure(String environment, Promise promise) {
        try {
            promise.resolve(LDClient.getForMobileKey(environment).getConnectionInformation().getLastFailure().getFailureType().name());
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    private String envConcat(String environment, String identifier) {
        return environment.concat(";").concat(identifier);
    }

    @ReactMethod
    public void registerFeatureFlagListener(final String flagKey, final String environment) {
        final String multiListenerId = envConcat(environment, flagKey);
        final FeatureFlagChangeListener listener = new FeatureFlagChangeListener() {
            @Override
            public void onFeatureFlagChange(String flagKey) {
                WritableMap result = Arguments.createMap();
                result.putString("flagKey", flagKey);
                result.putString("listenerId", multiListenerId);

                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(FLAG_PREFIX, result);
            }
        };

        try {
            LDClient.getForMobileKey(environment).registerFeatureFlagListener(flagKey, listener);
            listeners.put(flagKey, listener);
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void unregisterFeatureFlagListener(String flagKey, String environment) {
        String multiListenerId = envConcat(environment, flagKey);
        try {
            if (listeners.containsKey(multiListenerId)) {
                LDClient.getForMobileKey(environment).unregisterFeatureFlagListener(flagKey, listeners.get(multiListenerId));
                listeners.remove(multiListenerId);
            }
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void registerCurrentConnectionModeListener(final String listenerId, final String environment) {
        final String multiListenerId = envConcat(environment, listenerId);
        LDStatusListener listener = new LDStatusListener() {
            @Override
            public void onConnectionModeChanged(ConnectionInformation connectionInfo) {
                WritableMap result = Arguments.createMap();
                result.putString("connectionMode", gson.toJson(connectionInfo));
                result.putString("listenerId", multiListenerId);

                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(CONNECTION_MODE_PREFIX, result);
            }

            @Override
            public void onInternalFailure(LDFailure ldFailure) {}
        };

        try {
            LDClient.getForMobileKey(environment).registerStatusListener(listener);
            connectionModeListeners.put(multiListenerId, listener);
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void unregisterCurrentConnectionModeListener(String listenerId, String environment) {
        try {
            String multiListenerId = envConcat(environment, listenerId);
            if (connectionModeListeners.containsKey(multiListenerId)) {
                LDClient.getForMobileKey(environment).unregisterStatusListener(connectionModeListeners.get(multiListenerId));
                connectionModeListeners.remove(multiListenerId);
            }
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void registerAllFlagsListener(final String listenerId, final String environment) {
        final String multiListenerId = envConcat(environment, listenerId);
        LDAllFlagsListener listener = new LDAllFlagsListener() {
            @Override
            public void onChange(List<String> flagKeys) {
                WritableMap result = Arguments.createMap();
                result.putArray("flagKeys", Arguments.fromList(flagKeys));
                result.putString("listenerId", multiListenerId);

                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(ALL_FLAGS_PREFIX, result);
            }
        };

        try {
            LDClient.getForMobileKey(environment).registerAllFlagsListener(listener);
            allFlagsListeners.put(multiListenerId, listener);
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    @ReactMethod
    public void unregisterAllFlagsListener(String listenerId, String environment) {
        try {
            String multiListenerId = envConcat(environment, listenerId);
            if (allFlagsListeners.containsKey(multiListenerId)) {
                LDClient.getForMobileKey(environment).unregisterAllFlagsListener(allFlagsListeners.get(multiListenerId));
                allFlagsListeners.remove(multiListenerId);
            }
        } catch (Exception e) {
            Timber.w(e);
        }
    }

    private static LDValue toLDValue(Dynamic data) {
        if (data == null) {
            return LDValue.ofNull();
        }
        switch (data.getType()) {
            case Boolean: return LDValue.of(data.asBoolean());
            case Number: return LDValue.of(data.asDouble());
            case String: return LDValue.of(data.asString());
            case Array: return toLDValue(data.asArray());
            case Map: return toLDValue(data.asMap());
            default: return LDValue.ofNull();
        }
    }

    private static LDValue toLDValue(ReadableArray readableArray) {
        ArrayBuilder array = LDValue.buildArray();
        for (int i = 0; i < readableArray.size(); i++) {
            array.add(toLDValue(readableArray.getDynamic(i)));
        }
        return array.build();
    }

    private static LDValue toLDValue(ReadableMap readableMap) {
        ObjectBuilder object = LDValue.buildObject();
        ReadableMapKeySetIterator iter = readableMap.keySetIterator();
        while (iter.hasNextKey()) {
            String key = iter.nextKey();
            object.put(key, toLDValue(readableMap.getDynamic(key)));
        }
        return object.build();
    }

    private static Object ldValueToBridge(LDValue value) {
        switch (value.getType()) {
            case BOOLEAN: return value.booleanValue();
            case NUMBER: return value.doubleValue();
            case STRING: return value.stringValue();
            case ARRAY: return ldValueToArray(value);
            case OBJECT: return ldValueToMap(value);
            default: return null;
        }
    }

    private static WritableArray ldValueToArray(LDValue value) {
        WritableArray result = new WritableNativeArray();
        for (LDValue val : value.values()) {
            switch (val.getType()) {
                case NULL: result.pushNull(); break;
                case BOOLEAN: result.pushBoolean(val.booleanValue()); break;
                case NUMBER: result.pushDouble(val.doubleValue()); break;
                case STRING: result.pushString(val.stringValue()); break;
                case ARRAY: result.pushArray(ldValueToArray(val)); break;
                case OBJECT: result.pushMap(ldValueToMap(val)); break;
            }
        }
        return result;
    }

    private static WritableMap ldValueToMap(LDValue value) {
        WritableMap result = new WritableNativeMap();
        for (String key : value.keys()) {
            LDValue val = value.get(key);
            switch (val.getType()) {
                case NULL: result.putNull(key); break;
                case BOOLEAN: result.putBoolean(key, val.booleanValue()); break;
                case NUMBER: result.putDouble(key, val.doubleValue()); break;
                case STRING: result.putString(key, val.stringValue()); break;
                case ARRAY: result.putArray(key, ldValueToArray(val)); break;
                case OBJECT: result.putMap(key, ldValueToMap(val)); break;
            }
        }
        return result;
    }

    interface ConvertFromReadable<T> {
        T getFromMap(ReadableMap map, String key);
    }

    enum ConfigEntryType implements ConvertFromReadable {
        String(ReadableType.String) {
            public String getFromMap(ReadableMap map, String key) {
                return map.getString(key);
            }
        },
        Uri(ReadableType.String) {
            public Uri getFromMap(ReadableMap map, String key) {
                return android.net.Uri.parse(map.getString(key));
            }
        },
        Integer(ReadableType.Number) {
            public Integer getFromMap(ReadableMap map, String key) {
                return map.getInt(key);
            }
        },
        Boolean(ReadableType.Boolean) {
            public Boolean getFromMap(ReadableMap map, String key) {
                return map.getBoolean(key);
            }
        },
        Map(ReadableType.Map) {
            public Map getFromMap(ReadableMap map, String key) {
                return map.getMap(key).toHashMap();
            }
        },
        UserAttributes(ReadableType.Array) {
            public UserAttribute[] getFromMap(ReadableMap map, String key) {
                ReadableArray array = map.getArray(key);
                Set<UserAttribute> userAttributes = new HashSet<>();
                for (int i = 0; i < array.size(); i++) {
                    if (array.getType(i).equals(ReadableType.String)) {
                        userAttributes.add(UserAttribute.forName(array.getString(i)));
                    }
                }
                return userAttributes.toArray(new UserAttribute[0]);
            }
        };

        private final ReadableType base;

        ConfigEntryType(ReadableType base) {
            this.base = base;
        }

        ReadableType getReadableType() {
            return base;
        }
    }

    private static Method findSetter(Class cls, String methodName) {
        for (Method method : cls.getMethods()) {
            if (method.getName().equals(methodName) && method.getParameterTypes().length == 1)
                return method;
        }
        return null;
    }
}

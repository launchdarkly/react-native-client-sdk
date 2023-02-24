package com.launchdarkly.reactnative;

import static com.launchdarkly.reactnative.utils.LDUtil.configureContext;
import static com.launchdarkly.reactnative.utils.LDUtil.findSetter;
import static com.launchdarkly.reactnative.utils.LDUtil.getPrivateAttributesArray;
import static com.launchdarkly.reactnative.utils.LDUtil.ldValueToBridge;
import static com.launchdarkly.reactnative.utils.LDUtil.toLDValue;
import static com.launchdarkly.reactnative.utils.LDUtil.validateConfig;

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
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.launchdarkly.sdk.EvaluationDetail;
import com.launchdarkly.sdk.EvaluationReason;
import com.launchdarkly.sdk.LDContext;
import com.launchdarkly.sdk.LDUser;
import com.launchdarkly.sdk.LDValue;
import com.launchdarkly.sdk.ObjectBuilder;
import com.launchdarkly.sdk.UserAttribute;
import com.launchdarkly.sdk.android.Components;
import com.launchdarkly.sdk.android.ConnectionInformation;
import com.launchdarkly.sdk.android.FeatureFlagChangeListener;
import com.launchdarkly.sdk.android.LDAllFlagsListener;
import com.launchdarkly.sdk.android.LDClient;
import com.launchdarkly.sdk.android.LDConfig;
import com.launchdarkly.sdk.android.LDFailure;
import com.launchdarkly.sdk.android.LDStatusListener;
import com.launchdarkly.sdk.android.LaunchDarklyException;
import com.launchdarkly.sdk.android.integrations.ApplicationInfoBuilder;
import com.launchdarkly.sdk.android.integrations.EventProcessorBuilder;
import com.launchdarkly.sdk.android.integrations.HttpConfigurationBuilder;
import com.launchdarkly.sdk.android.integrations.PollingDataSourceBuilder;
import com.launchdarkly.sdk.android.integrations.ServiceEndpointsBuilder;
import com.launchdarkly.sdk.android.integrations.StreamingDataSourceBuilder;

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
    private static final Gson gson = new Gson();
    private static final String ERROR_INIT = "E_INITIALIZE";
    private static final String ERROR_IDENTIFY = "E_IDENTIFY";
    private static final String ERROR_CLOSE = "E_CLOSE";
    private static final String ERROR_UNKNOWN = "E_UNKNOWN";
    private static final String FLAG_PREFIX = "LaunchDarkly-Flag-";
    private static final String ALL_FLAGS_PREFIX = "LaunchDarkly-All-Flags-";
    private static final String CONNECTION_MODE_PREFIX = "LaunchDarkly-Connection-Mode-";
    private static boolean debugLoggingStarted = false;
    private final Map<String, FeatureFlagChangeListener> listeners = new HashMap<>();
    private final Map<String, LDStatusListener> connectionModeListeners = new HashMap<>();
    private final Map<String, LDAllFlagsListener> allFlagsListeners = new HashMap<>();

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
    public void configure(ReadableMap config, ReadableMap context, boolean isContext, final Promise promise) {
        internalConfigure(config, context, null, isContext, promise);
    }

    @ReactMethod
    public void configureWithTimeout(ReadableMap config, ReadableMap context, boolean isContext, Integer timeout, final Promise promise) {
        internalConfigure(config, context, timeout, isContext, promise);
    }

    private void internalConfigure(ReadableMap configMap, ReadableMap contextMap, final Integer timeout, boolean isContext, final Promise promise) {
        if (!debugLoggingStarted
                && validateConfig("debugMode", configMap, ReadableType.Boolean)
                && configMap.getBoolean("debugMode")) {
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

        final Application application = (Application) getReactApplicationContext().getApplicationContext();

        if (application != null) {
            Thread background = new Thread(new Runnable() {
                @Override
                public void run() {
                    final LDConfig config = buildConfiguration(configMap).build();
                    boolean isLegacyUser = !isContext;

                    try {
                        if (timeout != null) {
                            if (isLegacyUser) {
                                LDClient.init(application, config, configureLegacyUser(contextMap), timeout);
                            } else {
                                LDClient.init(application, config, configureContext(contextMap), timeout);
                            }
                        } else {
                            if (isLegacyUser) {
                                LDClient.init(application, config, configureLegacyUser(contextMap)).get();
                            } else {
                                LDClient.init(application, config, configureContext(contextMap)).get();
                            }
                        }
                    } catch (Exception e) {
                        Timber.e(e, "Exception during Client initialization");
                    }

                    promise.resolve(null);
                }
            });

            background.start();
        } else {
            Timber.e("Couldn't initialize the LaunchDarkly module because the application was null");
            promise.reject(ERROR_INIT, "Couldn't acquire ReactApplicationContext");
        }
    }

    /**
     * StreamingDataSourceBuilder and PollingDataSourceBuilder
     * backgroundPollingIntervalMillis, pollingIntervalMillis, stream
     *
     * @param config  The js config object
     * @param builder LDConfig.Builder
     */
    private void configureDataSource(ReadableMap config, LDConfig.Builder builder) {
        boolean stream = true;

        if (validateConfig("stream", config, ReadableType.Boolean)) {
            stream = config.getBoolean("stream");
        }

        if (stream) {
            StreamingDataSourceBuilder b = Components.streamingDataSource();

            if (validateConfig("backgroundPollingInterval", config, ReadableType.Number)) {
                b.backgroundPollIntervalMillis(config.getInt("backgroundPollingInterval"));
            }

            builder.dataSource(b);
        } else {
            PollingDataSourceBuilder b = Components.pollingDataSource();

            if (validateConfig("backgroundPollingInterval", config, ReadableType.Number)) {
                b.backgroundPollIntervalMillis(config.getInt("backgroundPollingInterval"));
            }

            if (validateConfig("pollingInterval", config, ReadableType.Number)) {
                b.pollIntervalMillis(config.getInt("pollingInterval"));
            }

            builder.dataSource(b);
        }
    }

    /**
     * EventProcessorBuilder (inlineUsersInEvents deprecated)
     * allAttributesPrivate, diagnosticRecordingIntervalMillis, eventsCapacity, eventsFlushIntervalMillis, privateAttributes
     *
     * @param config  The js config object
     * @param builder LDConfig.Builder
     */
    private void configureEvents(ReadableMap config, LDConfig.Builder builder) {
        EventProcessorBuilder b = Components.sendEvents();

        // Changed: allUserAttributesPrivate => allAttributesPrivate
        if (validateConfig("allAttributesPrivate", config, ReadableType.Boolean)) {
            b.allAttributesPrivate(config.getBoolean("allAttributesPrivate"));
        }

        // Changed: diagnosticRecordingIntervalMillis => diagnosticRecordingInterval
        if (validateConfig("diagnosticRecordingInterval", config, ReadableType.Number)) {
            b.diagnosticRecordingIntervalMillis(config.getInt("diagnosticRecordingInterval"));
        }

        // Changed: eventsCapacity => eventCapacity
        if (validateConfig("eventCapacity", config, ReadableType.Number)) {
            b.capacity(config.getInt("eventCapacity"));
        }

        // Changed: eventsFlushIntervalMillis => flushInterval
        if (validateConfig("flushInterval", config, ReadableType.Number)) {
            b.flushIntervalMillis(config.getInt("flushInterval"));
        }

        // Changed: privateAttributeNames => privateAttributes
        b.privateAttributes(getPrivateAttributesArray(config));

        builder.events(b);
    }

    /**
     * HttpConfigurationBuilder
     * connectionTimeoutMillis, useReport, wrapperName, wrapperVersion
     *
     * @param config  The js config object
     * @param builder LDConfig.Builder
     */
    private void configureHttp(ReadableMap config, LDConfig.Builder builder) {
        HttpConfigurationBuilder b = Components.httpConfiguration();

        if (validateConfig("connectionTimeout", config, ReadableType.Boolean)) {
            b.connectTimeoutMillis(config.getInt("connectionTimeout"));
        }

        if (validateConfig("useReport", config, ReadableType.Boolean)) {
            b.useReport(config.getBoolean("useReport"));
        }

        String wrapperName = "react-native-client-sdk";
        String wrapperVersion = "7.0.0";
        if (validateConfig("wrapperName", config, ReadableType.String)) {
            wrapperName = config.getString("wrapperName");
        }
        if (validateConfig("wrapperVersion", config, ReadableType.String)) {
            wrapperVersion = config.getString("wrapperVersion");
        }
        b.wrapper(wrapperName, wrapperVersion);

        builder.http(b);
    }

    /**
     * ServiceEndpointsBuilder
     * streamUrl, pollUrl, eventsUrl
     *
     * @param config
     * @param builder
     */
    private void configureEndpoints(ReadableMap config, LDConfig.Builder builder) {
        ServiceEndpointsBuilder b = Components.serviceEndpoints();

        if (validateConfig("streamUrl", config, ReadableType.String)) {
            b.streaming(config.getString("streamUrl"));
        }

        if (validateConfig("pollUrl", config, ReadableType.String)) {
            b.polling(config.getString("pollUrl"));
        }

        if (validateConfig("eventsUrl", config, ReadableType.String)) {
            b.events(config.getString("eventsUrl"));
        }

        builder.serviceEndpoints(b);
    }

    /**
     * ApplicationInfoBuilder
     * application: { id, version }
     *
     * @param config  The js config object
     * @param builder LDConfig.Builder
     */
    private void configureApplicationInfo(ReadableMap config, LDConfig.Builder builder) {
        // build application tags
        if (validateConfig("application", config, ReadableType.Map)) {
            ReadableMap application = config.getMap("application");
            ApplicationInfoBuilder b = Components.applicationInfo();

            if (validateConfig("id", config, ReadableType.String)) {
                b.applicationId(application.getString("id"));
            }
            if (validateConfig("version", config, ReadableType.String)) {
                b.applicationVersion(application.getString("version"));
            }

            builder.applicationInfo(b);
        }
    }

    private LDConfig.Builder buildConfiguration(ReadableMap config) {
        LDConfig.Builder builder = new LDConfig.Builder();
        builder.generateAnonymousKeys(true);

        // configure trivial options
        for (ConfigMapping entry : ConfigMapping.values()) {
            entry.loadFromMap(config, builder);
        }

        configureDataSource(config, builder);
        configureEvents(config, builder);
        configureHttp(config, builder);
        configureEndpoints(config, builder);
        configureApplicationInfo(config, builder);

        return builder;
    }


    private LDUser configureLegacyUser(ReadableMap options) {
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

        return userBuilder.build();
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
    public void jsonVariation(String flagKey, Dynamic defaultValue, String environment, Promise promise) {
        variation(LDClient::jsonValueVariation, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
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
    public void jsonVariationDetail(String flagKey, Dynamic defaultValue, String environment, Promise promise) {
        detailVariation(LDClient::jsonValueVariationDetail, id -> id, flagKey, toLDValue(defaultValue), environment, promise);
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
        } else {
            resultMap.put("variationIndex", LDValue.ofNull());
        }
        EvaluationReason reason = detail.getReason();
        if (reason == null) {
            resultMap.put("reason", LDValue.ofNull());
            return resultMap;
        }
        ObjectBuilder reasonMap = LDValue.buildObject();
        reasonMap.put("kind", reason.getKind().name());
        switch (reason.getKind()) {
            case RULE_MATCH:
                reasonMap.put("ruleIndex", reason.getRuleIndex());
                reasonMap.put("ruleId", reason.getRuleId());
                if (reason.isInExperiment()) {
                    reasonMap.put("inExperiment", true);
                }
                break;
            case PREREQUISITE_FAILED:
                reasonMap.put("prerequisiteKey", reason.getPrerequisiteKey());
                break;
            case ERROR:
                reasonMap.put("errorKind", reason.getErrorKind().name());
                break;
            case FALLTHROUGH:
                if (reason.isInExperiment()) {
                    reasonMap.put("inExperiment", true);
                }
            default:
                break;
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
    public void trackData(String eventName, Dynamic data, String environment) {
        trackSafe(environment, eventName, toLDValue(data), null);
    }

    @ReactMethod
    public void trackMetricValue(String eventName, Dynamic data, double metricValue, String environment) {
        trackSafe(environment, eventName, toLDValue(data), metricValue);
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
    public void identify(ReadableMap contextMap, boolean isContext, final Promise promise) {
        if (isContext) {
            LDContext context = configureContext(contextMap);

            Thread background = new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        LDClient.get().identify(context).get();
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
        } else {
            final LDUser user = configureLegacyUser(contextMap);
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
            public void onInternalFailure(LDFailure ldFailure) {
            }
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

    enum ConfigMapping {
        CONFIG_MOBILE_KEY("mobileKey", ConfigEntryType.String),
        CONFIG_DISABLE_BACKGROUND_UPDATING("disableBackgroundUpdating", ConfigEntryType.Boolean),
        CONFIG_OFFLINE("offline", ConfigEntryType.Boolean),
        CONFIG_EVALUATION_REASONS("evaluationReasons", ConfigEntryType.Boolean),
        CONFIG_MAX_CACHED_USERS("maxCachedContexts", ConfigEntryType.Integer),
        CONFIG_DIAGNOSTIC_OPT_OUT("diagnosticOptOut", ConfigEntryType.Boolean),
        CONFIG_SECONDARY_MOBILE_KEYS("secondaryMobileKeys", ConfigEntryType.Map);

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

    interface EvalCall<T> {
        T call(LDClient client, String flagKey, T defaultValue);
    }

    interface EvalDetailCall<T> {
        EvaluationDetail<T> call(LDClient client, String flagKey, T defaultValue);
    }

    interface ConvertFromReadable<T> {
        T getFromMap(ReadableMap map, String key);
    }
}

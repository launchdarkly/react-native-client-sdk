package com.launchdarkly.reactnative;

import android.app.Application;
import android.net.Uri;

import com.facebook.react.bridge.Arguments;
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
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonParser;
import com.google.gson.JsonParseException;
import com.launchdarkly.android.FeatureFlagChangeListener;
import com.launchdarkly.android.LDClient;
import com.launchdarkly.android.LDConfig;
import com.launchdarkly.android.LDCountryCode;
import com.launchdarkly.android.LDUser;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import timber.log.Timber;

/**
 * Module bound with React Native to be called from JavaScript
 */
public class LaunchdarklyReactNativeClientModule extends ReactContextBaseJavaModule {

    /**
     * An enum of all the supported configuration entries for LDClient configuration.
     *
     * <p>
     * Each enum value has a lookup key, entry type, and internal setter associated with it. The
     * lookup key is used to get the configuration value from a ReadableMap (JsonObject passed over
     * the react native bridge). The entry type specifies the base type looked up from the
     * ReadableMap as well as any additional conversion needed before setting the internal LDConfig
     * option, see @see ConfigEntryType for more. The internal setter is a String name of the setter
     * method used to pass the parsed configuration value into a LDConfig builder used for LDClient
     * setup.
     * </p>
     */
    enum ConfigMapping {
        CONFIG_MOBILE_KEY("mobileKey", ConfigEntryType.String, "setMobileKey"),
        CONFIG_BASE_URI("baseUri", ConfigEntryType.Uri, "setBaseUri"),
        CONFIG_EVENTS_URI("eventsUri", ConfigEntryType.UriMobile, "setEventsUri"),
        CONFIG_STREAM_URI("streamUri", ConfigEntryType.Uri, "setStreamUri"),
        CONFIG_EVENTS_CAPACITY("eventsCapacity", ConfigEntryType.Integer, "setEventsCapacity"),
        CONFIG_EVENTS_FLUSH_INTERVAL("eventsFlushIntervalMillis", ConfigEntryType.Integer, "setEventsFlushIntervalMillis"),
        CONFIG_CONNECTION_TIMEOUT("connectionTimeoutMillis", ConfigEntryType.Integer, "setConnectionTimeoutMillis"),
        CONFIG_POLLING_INTERVAL("pollingIntervalMillis", ConfigEntryType.Integer, "setPollingIntervalMillis"),
        CONFIG_BACKGROUND_POLLING_INTERVAL("backgroundPollingIntervalMillis", ConfigEntryType.Integer, "setBackgroundPollingIntervalMillis"),
        CONFIG_USE_REPORT("useReport", ConfigEntryType.Boolean, "setUseReport"),
        CONFIG_STREAM("stream", ConfigEntryType.Boolean, "setStream"),
        CONFIG_DISABLE_BACKGROUND_UPDATING("disableBackgroundUpdating", ConfigEntryType.Boolean, "setDisableBackgroundUpdating"),
        CONFIG_OFFLINE("offline", ConfigEntryType.Boolean, "setOffline"),
        CONFIG_PRIVATE_ATTRIBUTES("privateAttributeNames", ConfigEntryType.StringSet, "setPrivateAttributeNames");

        final String key;
        final ConfigEntryType type;
        private final Method setter;

        ConfigMapping(String key, ConfigEntryType type, String setterName) {
            this.key = key;
            this.type = type;
            this.setter = findSetter(LDConfig.Builder.class, setterName);
        }

        void loadFromMap(ReadableMap map, LDConfig.Builder builder) {
            if (map.hasKey(key) && map.getType(key).equals(type.getReadableType())) {
                try {
                    setter.invoke(builder, type.getFromMap(map, key));
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * An enum of all the supported configuration entries for LDUser configuration.
     *
     * <p>
     * Each enum value has a lookup key, entry type, and internal setter associated with it. The
     * lookup key is used to get the configuration value from a ReadableMap (JsonObject passed over
     * the react native bridge). The entry type specifies the base type looked up from the
     * ReadableMap as well as any additional conversion needed before setting the internal LDUser
     * option, @see ConfigEntryType for more. The internal setter is a String name of the setter
     * method used to pass the parsed configuration value into a LDUser builder.
     * </p>
     */
    enum UserConfigMapping {
        USER_ANONYMOUS("anonymous", ConfigEntryType.Boolean, "anonymous", null),
        USER_IP("ip", ConfigEntryType.String, "ip", "privateIp"),
        USER_EMAIL("email", ConfigEntryType.String, "email", "privateEmail"),
        USER_FIRST_NAME("firstName", ConfigEntryType.String, "firstName", "privateFirstName"),
        USER_LAST_NAME("lastName", ConfigEntryType.String, "lastName", "privateLastName"),
        USER_NAME("name", ConfigEntryType.String, "name", "privateName"),
        USER_SECONDARY("secondary", ConfigEntryType.String, "secondary", "privateSecondary"),
        USER_AVATAR("avatar", ConfigEntryType.String, "avatar", "privateAvatar"),
        USER_COUNTRY("country", ConfigEntryType.Country, "country", "privateCountry");

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
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // The LDClient instance
    private LDClient ldClient;
    // Current feature flag listeners
    private Map<String, FeatureFlagChangeListener> listeners = new HashMap<>();

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
    public String getName() {
        return "LaunchdarklyReactNativeClient";
    }

    // Constants used in promise rejection
    private static final String ERROR_INIT = "E_INITIALIZE";
    private static final String ERROR_IDENTIFY = "E_IDENTIFY";
    private static final String ERROR_CLOSE = "E_CLOSE";
    private static final String ERROR_UNKNOWN = "E_UNKNOWN";

    // Prefix for events sent over the React Native event bridge
    private static final String EVENT_PREFIX = "LaunchDarkly--";


    /**
     * Called automatically by the React Native bridging layer to associate constants with the
     * object used to call into native modules.
     *
     * @return A mapping of strings to values that will be included in the JS object.
     */
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("EVENT_PREFIX", EVENT_PREFIX);
        return constants;
    }

    /**
     * React Method called from JavaScript to initialize the LDClient using the supplied
     * configuration.
     *
     * @param config     LDConfig configuration, @see configBuild
     * @param userConfig LDUser configuration, @see userBuild
     * @param promise    Either rejected if an error was encountered, otherwise resolved with null
     *                   once client is initialized.
     */
    @ReactMethod
    public void configure(ReadableMap config, ReadableMap userConfig, final Promise promise) {
        if (ldClient != null) {
            promise.reject(ERROR_INIT, "Client was already initialized");
            return;
        }

        final LDConfig.Builder ldConfigBuilder = configBuild(config);
        final LDUser.Builder userBuilder = userBuild(userConfig);

        if (ldConfigBuilder == null) {
            promise.reject(ERROR_INIT, "Client could not be built using supplied configuration");
            return;
        }

        if (userBuilder == null) {
            promise.reject(ERROR_INIT, "User could not be built using supplied configuration");
            return;
        }

        final Application application = (Application) getReactApplicationContext().getApplicationContext();

        if (application != null) {
            Thread background = new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        ldClient = LDClient.init(application, ldConfigBuilder.build(), userBuilder.build()).get();
                        promise.resolve(null);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                        promise.reject(ERROR_INIT, e);
                    } catch (ExecutionException e) {
                        e.printStackTrace();
                        promise.reject(ERROR_INIT, e);
                    }
                }
            });

            background.start();
        } else {
            Timber.e("Couldn't initialize LaunchDarklyModule because the application was null");
            promise.reject(ERROR_INIT, "Couldn't acquire application context");
        }
    }

    /**
     * Create a LDConfig.Builder using configuration values from the options ReadableMap.
     *
     * <p>
     * This will look for all configuration values specified in {@link ConfigMapping}.
     * </p>
     *
     * @param options A ReadableMap of configuration options
     * @return A LDConfig.Builder configured with options
     */
    private LDConfig.Builder configBuild(ReadableMap options) {
        LDConfig.Builder builder = new LDConfig.Builder();

        for (ConfigMapping entry : ConfigMapping.values()) {
            entry.loadFromMap(options, builder);
        }

        return builder;
    }

    /**
     * Create a LDUser.Builder using configuration values from the options ReadableMap.
     *
     * <p>
     * This will look for all configuration values specified in {@link UserConfigMapping}.
     * </p>
     *
     * @param options A ReadableMap of configuration options
     * @return A LDUser.Builder configured with options
     */
    private LDUser.Builder userBuild(ReadableMap options) {
        if (!options.hasKey("key")) {
            return null;
        }

        String key = options.getString("key");
        LDUser.Builder userBuilder = new LDUser.Builder(key);

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
            ReadableMap custom = options.getMap("custom");
            ReadableMapKeySetIterator iterator = custom.keySetIterator();
            while (iterator.hasNextKey()) {
                String customKey = iterator.nextKey();
                switch (custom.getType(customKey)) {
                    case Boolean:
                        if (privateAttrs.contains(customKey)) {
                            userBuilder.privateCustom(customKey, custom.getBoolean(customKey));
                        } else {
                            userBuilder.custom(customKey, custom.getBoolean(customKey));
                        }
                        break;
                    case Number:
                        if (privateAttrs.contains(customKey)) {
                            userBuilder.privateCustom(customKey, custom.getDouble(customKey));
                        } else {
                            userBuilder.custom(customKey, custom.getDouble(customKey));
                        }
                        break;
                    case String:
                        if (privateAttrs.contains(customKey)) {
                            userBuilder.privateCustom(customKey, custom.getString(customKey));
                        } else {
                            userBuilder.custom(customKey, custom.getString(customKey));
                        }
                        break;
                    case Array:
                        ReadableArray array = custom.getArray(customKey);
                        ArrayList<String> strArray = null;
                        ArrayList<Number> numArray = null;
                        for (int i = 0; i < array.size(); i++) {
                            if (strArray != null) {
                                if (array.getType(i) == ReadableType.String) {
                                    strArray.add(array.getString(i));
                                }
                            } else if (numArray != null) {
                                if (array.getType(i) == ReadableType.Number) {
                                    numArray.add(array.getDouble(i));
                                }
                            } else if (array.getType(i) == ReadableType.String) {
                                strArray = new ArrayList<>();
                                strArray.add(array.getString(i));
                            } else if (array.getType(i) == ReadableType.Number) {
                                numArray = new ArrayList<>();
                                numArray.add(array.getDouble(i));
                            }
                        }
                        if (strArray != null) {
                            if (privateAttrs.contains(customKey)) {
                                userBuilder.privateCustomString(customKey, strArray);
                            } else {
                                userBuilder.customString(customKey, strArray);
                            }
                        } else if (numArray != null) {
                            if (privateAttrs.contains(customKey)) {
                                userBuilder.privateCustomNumber(customKey, numArray);
                            } else {
                                userBuilder.customNumber(customKey, numArray);
                            }
                        } else {
                            if (privateAttrs.contains(customKey)) {
                                userBuilder.privateCustomString(customKey, new ArrayList<String>());
                            } else {
                                userBuilder.customString(customKey, new ArrayList<String>());
                            }
                        }
                        break;
                    case Null:
                    case Map:
                        break;
                }
            }
        }

        return userBuilder;
    }

    @ReactMethod
    public void boolVariation(String flagKey, Promise promise) {
        boolVariationFallback(flagKey, null, promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void boolVariationFallback(String flagKey, Boolean fallback, Promise promise) {
        try {
            promise.resolve(ldClient.boolVariation(flagKey, fallback));
        } catch (Exception e) {
            promise.resolve(fallback);
        }
    }

    @ReactMethod
    public void intVariation(String flagKey, Promise promise) {
        intVariationFallback(flagKey, null, promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void intVariationFallback(String flagKey, Integer fallback, Promise promise) {
        try {
            promise.resolve(ldClient.intVariation(flagKey, fallback));
        } catch (Exception e) {
            promise.resolve(fallback);
        }
    }

    @ReactMethod
    public void floatVariation(String flagKey, Promise promise) {
        floatVariationFallback(flagKey, null, promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void floatVariationFallback(String flagKey, Float fallback, Promise promise) {
        try {
            promise.resolve(ldClient.floatVariation(flagKey, fallback));
        } catch (Exception e) {
            promise.resolve(fallback);
        }
    }

    @ReactMethod
    public void stringVariation(String flagKey, Promise promise) {
        stringVariationFallback(flagKey, null, promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void stringVariationFallback(String flagKey, String fallback, Promise promise) {
        try {
            promise.resolve(ldClient.stringVariation(flagKey, fallback));
        } catch (Exception e) {
            promise.resolve(fallback);
        }
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns null
     * value.
     *
     * @param flagKey The lookup key of the flag.
     * @param promise Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationNone(String flagKey, Promise promise) {
        jsonVariationBase(flagKey, null, promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationNumber(String flagKey, Double fallback, Promise promise) {
        jsonVariationBase(flagKey, new JsonPrimitive(fallback), promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationBool(String flagKey, Boolean fallback, Promise promise) {
        jsonVariationBase(flagKey, new JsonPrimitive(fallback), promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationString(String flagKey, String fallback, Promise promise) {
        jsonVariationBase(flagKey, new JsonPrimitive(fallback), promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationArray(String flagKey, ReadableArray fallback, Promise promise) {
        jsonVariationBase(flagKey, toJsonArray(fallback), promise);
    }

    /**
     * Looks up the current value for a flag, in the case of any issues, returns the given fallback
     * value.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if current value could not be acquired.
     * @param promise  Used to return the result to React Native
     */
    @ReactMethod
    public void jsonVariationObject(String flagKey, ReadableMap fallback, Promise promise) {
        jsonVariationBase(flagKey, toJsonObject(fallback), promise);
    }

    /**
     * Helper for jsonVariation methods.
     *
     * @param flagKey  The lookup key of the flag.
     * @param fallback A fallback value to return if the current value could not be acquired.
     * @param promise  Used to return the result to React Native.
     */
    private void jsonVariationBase(String flagKey, JsonElement fallback, Promise promise) {
        try {
            JsonElement jsonElement = ldClient.jsonVariation(flagKey, fallback);
            resolveJsonElement(promise, jsonElement);
        } catch (Exception e) {
            resolveJsonElement(promise, fallback);
        }
    }


    /**
     * Converts the jsonElement to a React  Native bridge compatible type and resolves the promise
     * with it's value.
     *
     * @param promise     Promise to resolve
     * @param jsonElement Value to convert and resolve promise with.
     */
    private void resolveJsonElement(Promise promise, JsonElement jsonElement) {
        if (jsonElement == null || jsonElement.isJsonNull()) {
            promise.resolve(null);
        } else if (jsonElement.isJsonArray()) {
            promise.resolve(fromJsonArray(jsonElement.getAsJsonArray()));
        } else if (jsonElement.isJsonObject()) {
            promise.resolve(fromJsonObject(jsonElement.getAsJsonObject()));
        } else {
            JsonPrimitive prim = jsonElement.getAsJsonPrimitive();
            if (prim.isBoolean()) {
                promise.resolve(prim.getAsBoolean());
            } else if (prim.isString()) {
                promise.resolve(prim.getAsString());
            } else {
                promise.resolve(prim.getAsNumber().doubleValue());
            }
        }
    }

    /**
     * Gets a object mapping of all flags and their values.
     *
     * @param promise resolved with WritableMap of flags to values.
     */
    @ReactMethod
    public void allFlags(Promise promise) {
        Map<String, ?> flags = ldClient.allFlags();

        // Convert map of all flags into WritableMap for React Native
        WritableMap response = new WritableNativeMap();
        for (Map.Entry<String, ?> entry : flags.entrySet()) {
            if (entry.getValue() == null) {
                response.putNull(entry.getKey());
            } else if (entry.getValue() instanceof String) {
                try {
                    JsonElement parsedJson = new JsonParser().parse((String) entry.getValue());
                    if (parsedJson.isJsonObject()) {
                        response.putMap(entry.getKey(), fromJsonObject((JsonObject) parsedJson.getAsJsonObject()));
                    } else if (parsedJson.isJsonArray()) {
                        response.putArray(entry.getKey(), fromJsonArray((JsonArray) parsedJson.getAsJsonArray()));
                    } else {
                        response.putString(entry.getKey(),(String) entry.getValue());
                    }
                } catch (JsonParseException e) {
                    response.putString(entry.getKey(),(String) entry.getValue());
                }
            } else if (entry.getValue() instanceof Boolean) {
                response.putBoolean(entry.getKey(), (Boolean) entry.getValue());
            } else if (entry.getValue() instanceof Double) {
                response.putDouble(entry.getKey(), (Double) entry.getValue());
            } else if (entry.getValue() instanceof Float) {
                response.putDouble(entry.getKey(), (Float) entry.getValue());
            } else if (entry.getValue() instanceof Integer) {
                response.putInt(entry.getKey(), (Integer) entry.getValue());
            } else if (entry.getValue() instanceof JsonNull) {
                response.putNull(entry.getKey());
            } else if (entry.getValue() instanceof JsonArray) {
                response.putArray(entry.getKey(), fromJsonArray((JsonArray) entry.getValue()));
            } else if (entry.getValue() instanceof JsonObject) {
                response.putMap(entry.getKey(), fromJsonObject((JsonObject) entry.getValue()));
            } else if (entry.getValue() instanceof JsonPrimitive) {
                JsonPrimitive primitive = (JsonPrimitive) entry.getValue();
                if (primitive.isString()) {
                    response.putString(entry.getKey(), primitive.getAsString());
                } else if (primitive.isBoolean()) {
                    response.putBoolean(entry.getKey(), primitive.getAsBoolean());
                } else if (primitive.isNumber()) {
                    response.putDouble(entry.getKey(), primitive.getAsDouble());
                }
            }
        }
        promise.resolve(response);
    }

    /**
     * Runs the SDK's trackData method with a number as custom data
     * <p>
     * Separately typed methods are necessary at the React Native bridging layer requires that
     * bridged method types disambiguate the value type.
     * </p>
     *
     * @param eventName Name of the event to track
     * @param data      The Double data to attach to the tracking event
     */
    @ReactMethod
    public void trackNumber(String eventName, Double data) {
        ldClient.track(eventName, new JsonPrimitive(data));
    }

    /**
     * Runs the SDK's trackData method with a Boolean as custom data
     * <p>
     * Separately typed methods are necessary at the React Native bridging layer requires that
     * bridged method types disambiguate the value type.
     * </p>
     *
     * @param eventName Name of the event to track
     * @param data      The Boolean data to attach to the tracking event
     */
    @ReactMethod
    public void trackBool(String eventName, Boolean data) {
        ldClient.track(eventName, new JsonPrimitive(data));
    }

    /**
     * Runs the SDK's trackData method with a String as custom data
     * <p>
     * Separately typed methods are necessary at the React Native bridging layer requires that
     * bridged method types disambiguate the value type.
     * </p>
     *
     * @param eventName Name of the event to track
     * @param data      The String data to attach to the tracking event
     */
    @ReactMethod
    public void trackString(String eventName, String data) {
        ldClient.track(eventName, new JsonPrimitive(data));
    }

    /**
     * Runs the SDK's trackData method with an Array as custom data
     * <p>
     * Separately typed methods are necessary at the React Native bridging layer requires that
     * bridged method types disambiguate the value type.
     * </p>
     *
     * @param eventName Name of the event to track
     * @param data      The Array data to attach to the tracking event
     */
    @ReactMethod
    public void trackArray(String eventName, ReadableArray data) {
        ldClient.track(eventName, toJsonArray(data));
    }

    /**
     * Runs the SDK's trackData method with an object as custom data
     * <p>
     * Separately typed methods are necessary at the React Native bridging layer requires that
     * bridged method types disambiguate the value type.
     * </p>
     *
     * @param eventName Name of the event to track
     * @param data      The Map(Object) data to attach to the tracking event
     */
    @ReactMethod
    public void trackObject(String eventName, ReadableMap data) {
        ldClient.track(eventName, toJsonObject(data));
    }

    /**
     * Track an event with a custom name.
     *
     * @param eventName Name of the event
     */
    @ReactMethod
    public void track(String eventName) {
        ldClient.track(eventName);
    }

    /**
     * Shuts down any network connections maintained by the client and puts the client in offline
     * mode.
     */
    @ReactMethod
    public void setOffline(Promise promise) {
        ldClient.setOffline();
        promise.resolve(true);
    }

    /**
     * Checks if the client is offline
     *
     * @param promise resolved with boolean value of whether client is offline, or rejected on error
     */
    @ReactMethod
    public void isOffline(Promise promise) {
        try {
            boolean result = ldClient.isOffline();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    /**
     * Restores network connectivity for the client, if the client was previously in offline mode.
     */
    @ReactMethod
    public void setOnline(Promise promise) {
        ldClient.setOnline();
        promise.resolve(true);
    }

    /**
     * Checks if the client is initialized
     *
     * @param promise resolved with boolean value of whether client is initialized, or rejected on
     *                error
     */
    @ReactMethod
    public void isInitialized(Promise promise) {
        try {
            boolean result = ldClient.isInitialized();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    /**
     * Triggers a background flush of pending events waiting to be sent to LaunchDarkly.
     */
    @ReactMethod
    public void flush() {
        ldClient.flush();
    }

    /**
     * Triggers a background flush and then closes all connections to LaunchDarkly.
     */
    @ReactMethod
    public void close(Promise promise) {
        try {
            ldClient.close();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(ERROR_CLOSE, e);
        }
    }

    /**
     * Calls LaunchDarkly's identify call that selects the user flags are pulled for, and tracking
     * events refer to.
     *
     * @param options User configuration ReadableMap (JS Object)
     * @param promise Resolved with null when identify complete or rejected with error
     */
    @ReactMethod
    public void identify(ReadableMap options, final Promise promise) {
        final LDUser.Builder userBuilder = userBuild(options);
        if (userBuilder == null) {
            promise.reject(ERROR_IDENTIFY, "User could not be built using supplied configuration");
            return;
        }
        Thread background = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    ldClient.identify(userBuilder.build()).get();
                    promise.resolve(null);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    promise.reject(ERROR_IDENTIFY, "Identify Interrupted");
                } catch (ExecutionException e) {
                    e.printStackTrace();
                    promise.reject(ERROR_IDENTIFY, "Exception while executing identify");
                }
            }
        });
        background.run();
    }

    @ReactMethod
    public void isDisableBackgroundPolling(Promise promise) {
        try {
            boolean result = ldClient.isDisableBackgroundPolling();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(ERROR_UNKNOWN, e);
        }
    }

    @ReactMethod
    public void registerFeatureFlagListener(String flagKey) {
        FeatureFlagChangeListener listener = new FeatureFlagChangeListener() {
            @Override
            public void onFeatureFlagChange(String flagKey) {
                WritableMap result = Arguments.createMap();
                result.putString("flagKey", flagKey);

                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(EVENT_PREFIX, result);
            }
        };

        ldClient.registerFeatureFlagListener(flagKey, listener);
        listeners.put(flagKey, listener);
    }

    @ReactMethod
    public void unregisterFeatureFlagListener(String flagKey) {
        if (listeners.containsKey(flagKey)) {
            ldClient.unregisterFeatureFlagListener(flagKey, listeners.get(flagKey));
            listeners.remove(flagKey);
        }
    }

    /**
     * Convert a ReadableMap into a JsonObject
     * <p>
     * This will recursively convert internal ReadableMaps and ReadableArrays into JsonObjects and
     * JsonArrays.
     * </p>
     *
     * @param readableMap A ReadableMap to be converted to a JsonObject
     * @return A JsonObject containing the converted elements from the ReadableMap.
     */
    private static JsonObject toJsonObject(ReadableMap readableMap) {
        if (readableMap == null)
            return null;

        JsonObject jsonObject = new JsonObject();

        ReadableMapKeySetIterator keySet = readableMap.keySetIterator();

        while (keySet.hasNextKey()) {
            String key = keySet.nextKey();
            ReadableType type = readableMap.getType(key);

            switch (type) {
                case Null:
                    jsonObject.add(key, null);
                    break;
                case Boolean:
                    jsonObject.addProperty(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    jsonObject.addProperty(key, readableMap.getDouble(key));
                    break;
                case String:
                    jsonObject.addProperty(key, readableMap.getString(key));
                    break;
                case Map:
                    jsonObject.add(key, toJsonObject(readableMap.getMap(key)));
                    break;
                case Array:
                    jsonObject.add(key, toJsonArray(readableMap.getArray(key)));
                    break;
            }
        }

        return jsonObject;
    }

    /**
     * Convert a ReadableArray into a JsonArray
     * <p>
     * This will recursively convert internal ReadableMaps and ReadableArrays into JsonObjects and
     * JsonArrays.
     * </p>
     *
     * @param readableArray A ReadableArray to be converted to a JsonArray
     * @return A JsonArray containing the converted elements from the ReadableArray
     */
    private static JsonArray toJsonArray(ReadableArray readableArray) {
        if (readableArray == null)
            return null;

        JsonArray jsonArray = new JsonArray();

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    jsonArray.add((Boolean) null);
                    break;
                case Boolean:
                    jsonArray.add(readableArray.getBoolean(i));
                    break;
                case Number:
                    jsonArray.add(readableArray.getDouble(i));
                    break;
                case String:
                    jsonArray.add(readableArray.getString(i));
                    break;
                case Map:
                    jsonArray.add(toJsonObject(readableArray.getMap(i)));
                    break;
                case Array:
                    jsonArray.add(toJsonArray(readableArray.getArray(i)));
                    break;
            }
        }

        return jsonArray;
    }

    /**
     * Convert a JsonArray into a WritableArray
     * <p>
     * This will recursively convert internal JsonObjects and JsonArrays into WritableMaps and
     * WritableArrays.
     * </p>
     *
     * @param jsonArray A JsonArray to be converted into a WritableArray
     * @return A WritableArray containing converted elements from the JsonArray
     */
    private static WritableArray fromJsonArray(JsonArray jsonArray) {
        if (jsonArray == null)
            return null;

        WritableArray result = new WritableNativeArray();
        for (JsonElement element : jsonArray) {
            if (element == null || element.isJsonNull()) {
                result.pushNull();
            } else if (element.isJsonObject()) {
                result.pushMap(fromJsonObject(element.getAsJsonObject()));
            } else if (element.isJsonArray()) {
                result.pushArray(fromJsonArray(element.getAsJsonArray()));
            } else if (element.isJsonPrimitive()) {
                JsonPrimitive primitive = element.getAsJsonPrimitive();
                if (primitive.isBoolean()) {
                    result.pushBoolean(primitive.getAsBoolean());
                } else if (primitive.isString()) {
                    result.pushString(primitive.getAsString());
                } else if (primitive.isNumber()) {
                    result.pushDouble(primitive.getAsDouble());
                }
            }
        }
        return result;
    }


    /**
     * Convert a JsonObject into a WritableMap
     * <p>
     * This will recursively convert internal JsonObjects and JsonArrays into WritableMaps and
     * WritableArrays.
     * </p>
     *
     * @param jsonObject A JsonObject to be converted into a WritableMap
     * @return A WritableMap containing converted elements from the jsonObject
     */
    private static WritableMap fromJsonObject(JsonObject jsonObject) {
        if (jsonObject == null)
            return null;

        WritableMap result = new WritableNativeMap();
        for (Map.Entry<String, JsonElement> entry : jsonObject.entrySet()) {
            if (entry.getValue() == null || entry.getValue().isJsonNull()) {
                result.putNull(entry.getKey());
            } else if (entry.getValue().isJsonObject()) {
                result.putMap(entry.getKey(), fromJsonObject(entry.getValue().getAsJsonObject()));
            } else if (entry.getValue().isJsonArray()) {
                result.putArray(entry.getKey(), fromJsonArray(entry.getValue().getAsJsonArray()));
            } else if (entry.getValue().isJsonPrimitive()) {
                JsonPrimitive primitive = entry.getValue().getAsJsonPrimitive();
                if (primitive.isBoolean()) {
                    result.putBoolean(entry.getKey(), primitive.getAsBoolean());
                } else if (primitive.isString()) {
                    result.putString(entry.getKey(), primitive.getAsString());
                } else if (primitive.isNumber()) {
                    result.putDouble(entry.getKey(), primitive.getAsDouble());
                }
            }
        }
        return result;
    }

    /**
     * A support interface for defining how a ConfigEntryType is read and converted from a
     * ReadableMap of configuration entries.
     *
     * @param <T> The returned type of a value read from the config entry.
     */
    interface ConvertFromReadable<T> {
        /**
         * Reads a config entry from map by key and converts to the appropriate return type of the
         * ConfigEntryType.
         *
         * @param map A ReadableMap to get the raw config entry
         * @param key The key to look up the config entry from the map
         * @return An appropriate return value for the ConfigEntryType
         */
        T getFromMap(ReadableMap map, String key);
    }

    /**
     * An enum for the supported types of config entries.
     *
     * <p>
     * Each type of config entry has a base ReadableType for checking that a ReadableMap contains an
     * entry of the correct type, as well as an implementation of ConvertFromReadable for retrieving
     * and converting a ReadableMap entry into a non base type for configuration processing.
     * </p>
     */
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
        UriMobile(ReadableType.String) {
            public Uri getFromMap(ReadableMap map, String key) {
                return android.net.Uri.parse(map.getString(key) + "/mobile");
            }
        },
        Country(ReadableType.String) {
            public LDCountryCode getFromMap(ReadableMap map, String key) {
                return LDCountryCode.valueOf(map.getString(key));
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
        StringSet(ReadableType.Array) {
            public Set<String> getFromMap(ReadableMap map, String key) {
                ReadableArray array = map.getArray(key);
                Set<String> returnSet = new HashSet<>();
                for (int i = 0; i < array.size(); i++) {
                    if (array.getType(i).equals(ReadableType.String)) {
                        returnSet.add(array.getString(i));
                    }
                }
                return returnSet;
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

    /**
     * A helper for looking up a method from a Java class (reflection).
     *
     * @param cls        The class to look up the method from
     * @param methodName The name of the method to look up
     * @return The looked up method (or null)
     */
    private static Method findSetter(Class cls, String methodName) {
        for (Method method : cls.getMethods()) {
            if (method.getName().equals(methodName) && method.getParameterTypes().length == 1)
                return method;
        }
        return null;
    }
}

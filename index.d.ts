/**
 * This is the API reference for the LaunchDarkly Client-Side SDK for React Native.
 *
 * In typical usage, you will instantiate [[LDClient]] and then call [[configure]] once at startup time to 
 * set up your connection to LaunchDarkly.
 *
 * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/client-side/react-native).
 */
declare module 'launchdarkly-react-native-client-sdk' {

    /**
     * Configuration options for the LaunchDarkly React Native SDK.
     */
    export type LDConfig = {
        /**
         * The mobile SDK key associated with your LaunchDarkly environment.
         * 
         * This field is required as the React Native SDK will use this value to uniquely 
         * identify your LaunchDarkly account.
         */
        mobileKey: string;

        /**
         * The base URI for the LaunchDarkly polling server.
         *
         * Most users should use the default value.
         */
        pollUri?: string;

        /**
         * The base URI for the LaunchDarkly streaming server.
         *
         * Most users should use the default value.
         */
        streamUri?: string;

        /**
         * The base URI for the LaunchDarkly events server.
         *
         * Most users should use the default value.
         */
        eventsUri?: string;

        /**
         * The capacity of the analytics events queue.
         * 
         * The client buffers up to this many events in memory before flushing. If the capacity is exceeded
         * before the queue is flushed, events will be discarded. Increasing the capacity means that events
         * are less likely to be discarded, at the cost of consuming more memory. Note that in regular usage
         * flag evaluations do not produce individual events, only summary counts, so you only need a large
         * capacity if you are generating a large number of click, pageview, or identify events (or if you
         * are using the event debugger).
         * 
         * The default value is 100.
         */
        eventsCapacity?: number;

        /**
         * The interval in between flushes of the analytics events queue, in milliseconds.
         *
         * The default value is 30000ms (30 seconds).
         */
        eventsFlushIntervalMillis?: number;
        
        /**
         * The timeout interval for connecting to LaunchDarkly for flag requests and event reports.
         * 
         * The default value is 10000ms (10 seconds).
         */
        connectionTimeoutMillis?: number;

        /**
         * The interval by which the SDK polls for flag updates when the application is in the foreground. This
         * property is only used if is the streaming connection is disabled.
         * 
         * The default value is 300000ms (5 min).
         */
        pollingIntervalMillis?: number;

        /**
         * The interval by which the SDK polls for flag updates when the application is in the background.
         * 
         * The default value is 3600000ms (1 hour).
         */
        backgroundPollingIntervalMillis?: number;

        /**
         * Whether or not to use the REPORT verb to fetch flag settings.
         *
         * If this is true, flag settings will be fetched with a REPORT request
         * including a JSON entity body with the user object.
         *
         * Otherwise (by default) a GET request will be issued with the user passed as
         * a base64 URL-encoded path parameter.
         *
         * Do not use unless advised by LaunchDarkly.
         */
        useReport?: boolean;

        /**
         * Whether or not to open a streaming connection to LaunchDarkly for live flag updates.
         *
         * If this is true, the client will always attempt to maintain a streaming connection; if false,
         * it never will. 
         * 
         * The default value is true.
         */
        stream?: boolean;

        /**
         * Whether or not the SDK should attempt to check for flag updates while the application
         * runs in the background.
         * 
         * If this is true, the client will periodically poll for updates while in the background; if
         * false, the SDK will not attempt to receive updates while the app is backgrounded.
         * 
         * The default value is false.
         */
        disableBackgroundUpdating?: boolean;

        /**
         * Disables all network calls from the LaunchDarkly SDK.
         * 
         * This can also be specified after the client has been created, using LDClient.setOffline().
         * 
         * The default value is true (the client will make network calls).
         */
        offline?: boolean;

        /**
         * Controls information logged to the console, and modifying some setting ranges to facilitate debugging.
         * 
         * This setting is only used when running in iOS. In Android this setting is ignored.
         * 
         * The default value is false.
         */
        debugMode?: boolean;

        /**
         * Whether LaunchDarkly should provide additional information about how flag values were
         * calculated.
         *
         * The additional information will then be available through the client's
         * `LDClient.*VariationDetail` methods. Since this increases the size of network requests,
         * such information is not sent unless you set this option to true.
         */
        evaluationReasons?: boolean;

        /**
         * Setting for the maximum number of locally cached users. Default is 5 users.
         */
        maxCachedUsers?: number;

        /**
         * Setting for whether sending diagnostic data about the SDK is disabled. The default is false.
         */
        diagnosticOptOut?: boolean;

        /**
         * The time interval between sending periodic diagnostic data. The default is 900000 (15 minutes).
         */
        diagnosticRecordingIntervalMillis?: number;

        /**
         * Whether to treat all user attributes as private for event reporting for all users.
         * The SDK will not include private attribute values in analytics events, but private attribute names will be sent. 
         * The default is false.
         */
        allUserAttributesPrivate?: boolean;
    };
  
    /**
     * A LaunchDarkly user object.
     */
    export type LDUser = {

        /**
         * A unique string identifying a user.
         */
        key: string;

        /**
         * The user's name.
         *
         * You can search for users on the User page by name.
         */
        name?: string;

        /**
         * The user's first name.
         */
        firstName?: string;

        /**
         * The user's last name.
         */
        lastName?: string;

        /**
         * The user's email address.
         */
        email?: string;

        /**
         * Whether to show the user on the Users page in LaunchDarkly.
         * 
         * The default value is false.
         */
        anonymous?: boolean;

        /**
         * The country associated with the user.
         */
        country?: string;

        /**
         * Specifies a list of attribute names (either built-in or custom) which should be
         * marked as private, and not sent to LaunchDarkly in analytics events.
         */
        privateAttributeNames?: string[];

        /**
         * Any additional attributes associated with the user.
         */
        custom?: { [key: string]: any };

        /**
         * The IP address associated with the user.
         */
        ip?: string;

        /**
         * The avatar associated with the user.
         */
        avatar?: string;
    };
  
    /**
     * Describes the kind of error which occurred when a flag evaluation was calculated.
     */
    export enum LDEvaluationReasonErrorKind {
        /**
         * The client is not able to establish a connection to LaunchDarkly yet. 
         * 
         * If there is a persistent feature store, the store does not yet contain flag data.
         */
        CLIENT_NOT_READY = 'CLIENT_NOT_READY',

        /**
         * The flag key did not match any known flag.
         */
        FLAG_NOT_FOUND = 'FLAG_NOT_FOUND',

        /**
         * The user object or user key was not provided.
         */
        USER_NOT_SPECIFIED = 'USER_NOT_SPECIFIED',

        /**
         * There was an internal inconsistency in the flag data. For example, a rule specified a nonexistent variation.
         * 
         * This is an unusual condition that might require assistance from LaunchDarkly's Support team.
         */
        MALFORMED_FLAG = 'MALFORMED_FLAG',

        /**
         * The application code requested the flag value with a different data type than it actually is. 
         * 
         * For example, the code asked for a boolean when the flag type is actually a string.
         */
        WRONG_TYPE = 'WRONG_TYPE',

        /**
         * An unexpected error stopped flag evaluation. This could happen if you are using a persistent feature store and the database stops working.
         * 
         * When this happens, the SDK always prints the specific error to the log.
         */
        EXCEPTION = 'EXCEPTION',
    }
  
    /**
     * Describes the reason behind how a flag evaluation was calculated.
     */
    export enum LDEvaluationReasonKind {
        /**
         * The flag is off and therefore returned its configured off value. 
         * 
         * This value appears on the dashboard next to "If targeting is off, serve:".
         */
        OFF = 'OFF',

        /**
         * The flag is on, but the user did not match any targets or rules, so it returned the value that appears on the dashboard under "Default rule."
         */
        FALLTHROUGH = 'FALLTHROUGH',

        /**
         * The user key was specifically targeted for this flag in the "Target individual users" section.
         */
        TARGET_MATCH = 'TARGET_MATCH',

        /**
         * The user who encountered the flag matched one of the flag's rules.
         */
        RULE_MATCH = 'RULE_MATCH',

        /**
         * The flag had at least one prerequisite flag that either was off or did not return the desired variation. 
         * 
         * Because of this, the flag returned its "off" value.
         */
        PREREQUISITE_FAILED = 'PREREQUISITE_FAILED',

        /**
         * The flag could not be evaluated, so the default value was returned.
         */
        ERROR = 'ERROR',
    }

    /**
     * Describes what state of connection to LaunchDarkly the SDK is in.
     */
    export enum LDConnectionMode {
        /**
         * The SDK is either connected to the flag stream, or is actively attempting to acquire a connection.
         */
        STREAMING = 'STREAMING',

        /**
         * The SDK was configured with streaming disabled, and is in foreground polling mode.
         */
        POLLING = 'POLLING',

        /**
         * (Android specific enum value) The SDK has detected the application is in the background and has transitioned to 
         * battery conscious background polling.
         */
        BACKGROUND_POLLING = 'BACKGROUND_POLLING',

        /**
         * (Android specific enum value) The SDK was configured with background polling disabled. The SDK has detected 
         * the application is in the background and is not attempting to update the flag cache.
         */
        BACKGROUND_DISABLED = 'BACKGROUND_DISABLED',

        /**
         * The SDK has detected that the mobile device does not have an active network connection so has ceased flag update 
         * attempts until the network status changes.
         */
        OFFLINE = 'OFFLINE',

        /**
         * (Android specific enum value) The SDK has been explicitly set offline, either in the initial configuration, 
         * by setOffline(), or as a result of failed authentication to LaunchDarkly. 
         * The SDK will stay offline unless setOnline() is called.
         */
        SET_OFFLINE = 'SET_OFFLINE',

        /**
         * (Android specific enum value) The shutdown state indicates the SDK has been permanently shutdown as a result of 
         * a call to close().
         */
        SHUTDOWN = 'SHUTDOWN',

        /**
         * (iOS specific enum value) The SDK is attempting to connect to LaunchDarkly by streaming.
         */
        ESTABLISHING_STREAMING_CONNECTION = 'ESTABLISHING_STREAMING_CONNECTION',
    }

    /**
     * Describes why a connection request to LaunchDarkly failed.
     */
    export enum LDFailureReason {
        /**
         * This indicates when no error has been recorded.
         */
        NONE = 'NONE',

        /**
         * This indicates when there is an internal error in the stream request.
         */
        UKNOWN_ERROR ='UNKNOWN_ERROR',

        /**
         * (iOS specific enum value) This indicates when an incorrect mobile key is provided.
         */
        UNAUTHORIZED = 'UNAUTHORIZED',

        /**
         * (iOS specific enum value) This indicates when an error with an HTTP error code is present.
         */
        HTTP_ERROR = 'HTTP_ERROR',

        /**
         * (Android specific enum value) This indicates the LDFailure is an instance of LDInvalidResponseCodeFailure. 
         * See Android documentation for more details.
         */
        UNEXPECTED_RESPONSE_CODE = 'UNEXPECTED_RESPONSE_CODE',

        /**
         * (Android specific enum value) An event was received through the stream was had an unknown event name. 
         * This could indicate a newer SDK is available if new event types have become available through the 
         * flag stream since the SDKs release.
         */
        UNEXPECTED_STREAM_ELEMENT_TYPE = 'UNEXPECTED_STREAM_ELEMENT_TYPE',

        /**
         * (Android specific enum value) A network request for polling, or the EventSource stream reported a failure.
         */
        NETWORK_FAILURE = 'NETWORK_FAILURE',

        /**
         * (Android specific enum value) A response body received either through polling or streaming was unable to be parsed.
         */
        INVALID_RESPONSE_BODY = 'INVALID_RESPONSE_BODY',
    }
  
    /**
     * The flag is off and therefore returned its configured off value.
     */
    export type LDEvaluationReasonOff = {
        kind: LDEvaluationReasonKind.OFF;
    };
  
    /**
     * The flag is on, but the user did not match any targets or rules, so it returned the value that appears 
     * on the dashboard under "Default rule."
     */
    export type LDEvaluationReasonFallthrough = {
        kind: LDEvaluationReasonKind.FALLTHROUGH;
    };
  
    /**
     * The user key was specifically targeted for this flag in the "Target individual users" section.
     */
    export type LDEvaluationReasonTargetMatch = {
        kind: LDEvaluationReasonKind.TARGET_MATCH;
    };
  
    /**
     * The user who encountered the flag matched one of the flag's rules.
     */
    export type LDEvaluationReasonRuleMatch = {
        kind: LDEvaluationReasonKind.RULE_MATCH;

        /**
         * The positional index of the matched rule (0 for the first rule).
         */
        ruleIndex: number;

        /**
         * The rule's unique identifier, which stays the same even if you rearrange the order of the rules.
         */
        ruleId: string;
    };
  
    /**
     * The flag had at least one prerequisite flag that either was off or did not return the desired variation. 
     * Because of this, the flag returned its "off" value.
     */
    export type LDEvaluationReasonPrerequisiteFailed = {
        kind: LDEvaluationReasonKind.PREREQUISITE_FAILED;

        /**
         * The key of the prerequisite flag that failed.
         */
        prerequisiteKey: string;
    };
  
    /**
     * The flag could not be evaluated, so the default value was returned.
     */
    export type LDEvaluationReasonError = {
        kind: LDEvaluationReasonKind.ERROR;

        /**
         * The kind of error which occurred.
         */
        errorKind: LDEvaluationReasonErrorKind;
    };
  
    /**
     * Describes the reason that a flag evaluation produced a particular value. This is
     * part of the [[LDEvaluationDetail]] object returned by the variation detail methods.
     */
    export type LDEvaluationReason =
        | LDEvaluationReasonOff
        | LDEvaluationReasonFallthrough
        | LDEvaluationReasonTargetMatch
        | LDEvaluationReasonRuleMatch
        | LDEvaluationReasonPrerequisiteFailed
        | LDEvaluationReasonError;
  
    /**
     * An object that combines the result of a feature flag evaluation with information about
     * how it was calculated.
     *
     * This is the result of calling one of the `LDClient.*VariationDetail` methods.
     *
     * For more information, see the [documentation](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
     * 
     * @typeparam T
     *   The type of flag being evaluated.
     */
    export type LDEvaluationDetail<T> = {
        /**
         * The result of the flag evaluation. This will be either one of the flag's variations or
         * the default value that was passed to the variation detail function.
         */
        value: T;

        /**
         * The index of the returned value within the flag's list of variations, e.g. 0 for the
         * first variation-- or `null` if the default value was returned.
         */
        variationIndex?: number;

        /**
         * An object describing the main factor that influenced the flag evaluation value.
         */
        reason: LDEvaluationReason;
    };

    /**
     * A map of feature flags from their keys to their values.
     */
    export interface LDFlagSet {
        [key: string]: any;
    }
    
    /**
     * The LaunchDarkly SDK client object.
     *
     * Applications should configure the client at application startup time and reuse the same instance.
     *
     * For more information, see the [SDK Reference Guide](https://docs.launchdarkly.com/sdk/client-side/react-native).
     */
    export default class LDClient {
        constructor();

        /**
         * Returns the SDK version.
         * 
         * @returns
         *   A string containing the SDK version.
         */
        getVersion(): string;

        /**
         * Initialize the SDK to work with the specified client configuration options and on behalf of the specified user.
         * Will block for a number of seconds represented until flags are received from LaunchDarkly if the timeout parameter
         * is passed.
         * 
         * This should only be called once at application start time.
         * 
         * @param config 
         *   the client configuration options
         * @param user 
         *   the user
         * @param timeout
         *   (Optional) A number representing how long to wait for flags
         */
        configure(config: LDConfig, user: LDUser, timeout?: number): Promise<null>;
        
        /**
         * Determines the variation of a boolean feature flag for the current user.
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing the flag's value.
         */
        boolVariation(flagKey: string, defaultValue: boolean): Promise<boolean>;

        /**
         * Determines the variation of an integer feature flag for the current user.
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing the flag's value.
         */
        intVariation(flagKey: string, defaultValue: number): Promise<number>;

        /**
         * Determines the variation of a floating-point feature flag for the current user.
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing the flag's value.
         */
        floatVariation(flagKey: string, defaultValue: number): Promise<number>;

        /**
         * Determines the variation of a string feature flag for the current user.
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing the flag's value.
         */
        stringVariation(flagKey: string, defaultValue: string): Promise<string>;

        /**
         * Determines the variation of a JSON feature flag for the current user.
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing the flag's value.
         */
        jsonVariation(
            flagKey: string,
            defaultValue: Record<string, any>,
        ): Promise<Record<string, any>>;
        
        /**
         * Determines the variation of a boolean feature flag for a user, along with information about how it was
         * calculated.
         *
         * Note that this will only work if you have set `evaluationReasons` to true in [[LDConfig]].
         * Otherwise, the `reason` property of the result will be null.
         *
         * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing an [[LDEvaluationDetail]] object containing the value and explanation.
         */
        boolVariationDetail(
            flagKey: string,
            defaultValue: boolean,
        ): Promise<LDEvaluationDetail<boolean>>;

        /**
         * Determines the variation of an integer feature flag for a user, along with information about how it was
         * calculated.
         *
         * Note that this will only work if you have set `evaluationReasons` to true in [[LDConfig]].
         * Otherwise, the `reason` property of the result will be null.
         *
         * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing an [[LDEvaluationDetail]] object containing the value and explanation.
         */
        intVariationDetail(
            flagKey: string,
            defaultValue: number,
        ): Promise<LDEvaluationDetail<number>>;

        /**
         * Determines the variation of a floating-point feature flag for a user, along with information about how it was
         * calculated.
         *
         * Note that this will only work if you have set `evaluationReasons` to true in [[LDConfig]].
         * Otherwise, the `reason` property of the result will be null.
         *
         * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing an [[LDEvaluationDetail]] object containing the value and explanation.
         */
        floatVariationDetail(
            flagKey: string,
            defaultValue: number,
        ): Promise<LDEvaluationDetail<number>>;

        /**
         * Determines the variation of a string feature flag for a user, along with information about how it was
         * calculated.
         *
         * Note that this will only work if you have set `evaluationReasons` to true in [[LDConfig]].
         * Otherwise, the `reason` property of the result will be null.
         *
         * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing an [[LDEvaluationDetail]] object containing the value and explanation.
         */
        stringVariationDetail(
            flagKey: string,
            defaultValue: string,
        ): Promise<LDEvaluationDetail<string>>;

        /**
         * Determines the variation of a JSON feature flag for a user, along with information about how it was
         * calculated.
         *
         * Note that this will only work if you have set `evaluationReasons` to true in [[LDConfig]].
         * Otherwise, the `reason` property of the result will be null.
         *
         * For more information, see the [SDK reference guide](https://docs.launchdarkly.com/sdk/concepts/evaluation-reasons).
         *
         * @param flagKey
         *   The unique key of the feature flag.
         * @param defaultValue
         *   The default value of the flag, to be used if the value is not available from LaunchDarkly.
         * @returns
         *   A promise containing an [[LDEvaluationDetail]] object containing the value and explanation.
         */
        jsonVariationDetail(
            flagKey: string,
            defaultValue: Record<string, any>,
        ): Promise<LDEvaluationDetail<Record<string, any>>>;
        
        /**
         * Returns a map of all available flags to the current user's values.
         *
         * @returns
         *   A promise containing an object in which each key is a feature flag key and each value is the flag value.
         *   The promise will be rejected if the SDK has not yet completed initialization.
         *   Note that there is no way to specify a default value for each flag as there is with the
         *   `*Variation` methods, so any flag that cannot be evaluated will have a null value.
         */
        allFlags(): Promise<LDFlagSet>;
        
        /**
         * Track events to use in goals or A/B tests.
         *
         * @param eventName
         *   The name of the event, which may correspond to a goal in A/B tests.
         * @param data
         *   Optional additional information to associate with the event.
         * @param metricValue
         *   Optional numeric value to attach to the tracked event
         */
        track(eventName: string, data?: any, metricValue?: number): void;
        
        /**
         * Checks whether the client has been put into offline mode. This is true only if [[setOffline]]
         * was called, or if the configuration had [[LDConfig.offline]] set to true,
         * not if the client is simply offline due to a loss of network connectivity.
         *
         * @returns 
         *   A promise containing true if the client is in offline mode
         */
        isOffline(): Promise<boolean>;

        /**
         * Shuts down any network connections maintained by the client and puts the client in offline
         * mode, preventing the client from opening new network connections until [[setOnline]] is called.
         * 
         * Note: The client automatically monitors the device's network connectivity and app foreground
         * status, so calling [[setOffline]] or [[setOnline]] is normally unnecessary in most situations.
         * 
         * @returns 
         *   A promise containing true if the change was made successfully
         */
        setOffline(): Promise<boolean>;

        /**
         * Restores network connectivity for the client, if the client was previously in offline mode.
         * This operation may be throttled if it is called too frequently.
         * 
         * Note: The client automatically monitors the device's network connectivity and app foreground
         * status, so calling [[setOffline]] or [[setOnline]] is normally unnecessary in most situations.
         * 
         * @returns 
         *   A promise containing true if the change was made successfully
         */
        setOnline(): Promise<boolean>;

        /**
         * Checks whether the client is ready to return feature flag values. This is true if either
         * the client has successfully connected to LaunchDarkly and received feature flags, or the
         * client has been put into offline mode (in which case it will return only default flag values).
         * 
         * This function only works when running in Android. On iOS, this function will return a rejected promise.
         *
         * @returns 
         *   A promise contianing true if the client is initialized or offline
         */
        isInitialized(): Promise<boolean>;
        
        /**
         * Flushes all pending analytics events.
         *
         * Normally, batches of events are delivered in the background at intervals determined by the
         * `eventsFlushIntervalMillis` property of [[LDConfig]]. Calling `flush` triggers an 
         * immediate delivery.
         */
        flush(): void;
        
        /**
         * Shuts down the client and releases its resources, after delivering any pending analytics
         * events. After the client is closed, all calls to the `*Variation` methods will return default values,
         * and it will not make any requests to LaunchDarkly.
         */
        close(): Promise<void>;
        
        /**
         * Sets the current user, retrieves flags for that user, then sends an Identify Event to LaunchDarkly.
         *
         * @param user
         *   The user for evaluation and event reporting
         * @returns 
         *   A promise indicating when this operation is complete (meaning that flags are ready for evaluation).
         */
        identify(user: LDUser): Promise<null>;
        
        /**
         * Registers a callback to be called when the flag with key `flagKey` changes from its current value. 
         *
         * @param flagKey
         *   The flag key to attach the callback to
         * @param callback 
         *   The callback to attach to the flag key
         */
        registerFeatureFlagListener(
            flagKey: string,
            callback: (flagKey: string) => void,
        ): void;

        /**
         * Unregisters a callback for the flag with key `flagKey`.
         *
         * @param flagKey  
         *   The flag key to remove the callback from
         * @param callback 
         *   The callback to remove from the flag key
         */
        unregisterFeatureFlagListener(
            flagKey: string,
            callback: (flagKey: string) => void,
        ): void;

        /**
         * Returns the current state of the connection to LaunchDarkly.
         *
         * @returns 
         *   A promise containing a LDConnectionMode enum value representing the status of the connection to LaunchDarkly.
         */
        getConnectionMode(): Promise<LDConnectionMode>;

        /**
         * Returns the most recent successful flag cache update in millis from the epoch
         * or null if flags have never been retrieved.
         *
         * @returns 
         *   A promise containing a number representing the status of the connection to LaunchDarkly, 
         *   or null if a successful connection has yet to be established.
         */
        getLastSuccessfulConnection(): Promise<number | null>;

        /**
         * Most recent unsuccessful flag cache update attempt in millis from the epoch
         * or null if flag update has never been attempted.
         *
         * @returns 
         *   A promise containing a number representing the status of the connection to LaunchDarkly, 
         *   or null if a failed connection has yet to occur.
         */
        getLastFailedConnection(): Promise<number | null>;

        /**
         * Returns the most recent connection failure reason or null.
         *
         * @returns 
         *   A promise containing a LDFailureReason enum value representing the reason for the most recently failed 
         *   connection to LaunchDarkly, or null if a failed connection has yet to occur.
         */
        getLastFailure(): Promise<LDFailureReason | null>;
        
        /**
         * Registers a callback to be called on connection status updates.
         * 
         * @param listenerId 
         *   The listener to be called on a connection status update
         * @param callback
         *   The callback to attach to the connection status update
         */
        registerCurrentConnectionModeListener(
            listenerId: string,
            callback: (connectionMode: string) => void,
        ): void;

        /**
         * Unregisters a callback so that it will no longer be called on connection status updates.
         * 
         * @param listenerId 
         *   The listener to remoce the callback from
         */
        unregisterCurrentConnectionModeListener(listenerId: string): void;
        
        /**
         * Registers a callback to be called when a flag update is processed by the SDK.
         * 
         * @param listenerId 
         *   The listener to be called when a flag update is processed
         * @param callback
         *   The callback to attach to the flag update
         */
        registerAllFlagsListener(
            listenerId: string,
            callback: (updatedFlags: string[]) => void,
        ): void;

        /**
         * Unregisters a callback so it will no longer be called on flag updates.
         * 
         * @param listenerId 
         *   The listener to be removed
         */
        unregisterAllFlagsListener(listenerId: string): void;
    }
  }
  

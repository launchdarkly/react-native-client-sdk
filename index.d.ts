declare module 'launchdarkly-react-native-client-sdk' {
  export type LDClientConfig = {
    mobileKey: string;
    baseUri?: string;
    streamUri?: string;
    eventsUri?: string;
    eventsCapacity?: number;
    eventsFlushIntervalMillis?: number;
    connectionTimeoutMillis?: number;
    pollingIntervalMillis?: number;
    backgroundPollingIntervalMillis?: number;
    useReport?: boolean;
    stream?: boolean;
    disableBackgroundUpdating?: boolean;
    offline?: boolean;
    debugMode?: boolean;
  };

  export type LDUserConfig = {
    key: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    anonymous?: boolean;
    privateAttributeNames?: string[];
    custom?: { [key: string]: any };
  };

  export enum ErrorKind {
    // The client is not able to establish a connection to LaunchDarkly yet. If there is a persistent feature store, the store does not yet contain flag data.
    CLIENT_NOT_READY = 'CLIENT_NOT_READY',
    // The flag key did not match any known flag.
    FLAG_NOT_FOUND = 'FLAG_NOT_FOUND',
    // The user object or user key was not provided.
    USER_NOT_SPECIFIED = 'USER_NOT_SPECIFIED',
    // There was an internal inconsistency in the flag data. For example, a rule specified a nonexistent variation.
    // This is an unusual condition that might require assistance from LaunchDarkly's Support team.
    MALFORMED_FLAG = 'MALFORMED_FLAG',
    // The application code requested the flag value with a different data type than it actually is. For example, the code asked for a boolean when the flag type is actually a string.
    // This can only happen in strongly typed languages, such as Go, Java, and C#.
    WRONG_TYPE = 'WRONG_TYPE',
    //An unexpected error stopped flag evaluation. This could happen if you are using a persistent feature store and the database stops working.
    //When this happens, the SDK always prints the specific error to the log.
    EXCEPTION = 'EXCEPTION',
  }

  export enum ReasonKind {
    // The flag is off and therefore returned its configured off value. This value appears on the dashboard next to "If targeting is off, serve:".
    OFF = 'OFF',
    // The flag is on, but the user did not match any targets or rules, so it returned the value that appears on the dashboard under "Default rule."
    // The "default rule" is not the same thing as the default value discussed in "Error conditions".
    FALLTHROUGH = 'FALLTHROUGH',
    // The user key was specifically targeted for this flag in the "Target individual users" section.
    TARGET_MATCH = 'TARGET_MATCH',
    // The user who encountered the flag matched one of the flag's rules.
    // In this case, the reason object also has these properties:
    //   * ruleIndex : The positional index of the matched rule (0 for the first rule).
    //   * ruleId: The rule's unique identifier, which stays the same even if you rearrange the order of the rules.
    RULE_MATCH = 'RULE_MATCH',
    // The flag had at least one prerequisite flag that either was off or did not return the desired variation. Because of this, the flag returned its "off" value.
    // In this case, the reason object also has this property:
    //   * prerequisiteKey : The key of the prerequisite flag that failed.
    PREREQUISITE_FAILED = 'PREREQUISITE_FAILED',
    // The flag could not be evaluated, so the default value was returned
    ERROR = 'ERROR',
  }

  export type ReasonOff = {
    kind: ReasonKind.OFF;
  };

  export type ReasonFallthrough = {
    kind: ReasonKind.FALLTHROUGH;
  };

  export type ReasonTargetMatch = {
    kind: ReasonKind.TARGET_MATCH;
  };

  export type ReasonRuleMatch = {
    kind: ReasonKind.RULE_MATCH;
    // The positional index of the matched rule (0 for the first rule).
    ruleIndex: number;
    // The rule's unique identifier, which stays the same even if you rearrange the order of the rules.
    ruleId: string;
  };

  export type ReasonPrerequisiteFailed = {
    kind: ReasonKind.PREREQUISITE_FAILED;
    // The key of the prerequisite flag that failed.
    prerequisiteKey: string;
  };

  export type ReasonError = {
    kind: ReasonKind.ERROR;
    errorKind: ErrorKind;
  };

  export type Reason =
    | ReasonOff
    | ReasonFallthrough
    | ReasonTargetMatch
    | ReasonRuleMatch
    | ReasonPrerequisiteFailed
    | ReasonError;

  export type VariationDetail<T> = {
    value: T;
    variationIndex: number;
    reason: Reason;
  };

  export default class LDClient<T> {
    constructor();
    configure(config: LDClientConfig, userConfig: LDUserConfig): any;
    boolVariation(flagKey: string, fallback: boolean): Promise<boolean>;
    intVariation(flagKey: string, fallback: number): Promise<number>;
    floatVariation(flagKey: string, fallback: number): Promise<number>;
    stringVariation(flagKey: string, fallback: string): Promise<string>;
    jsonVariation(
      flagKey: string,
      fallback: Record<string, any>,
    ): Promise<Record<string, any>>;
    boolVariationDetail(
      flagKey: string,
      fallback: boolean,
    ): Promise<VariationDetail<boolean> | boolean>;
    intVariationDetail(
      flagKey: string,
      fallback: number,
    ): Promise<VariationDetail<number> | number>;
    floatVariationDetail(
      flagKey: string,
      fallback: number,
    ): Promise<VariationDetail<number> | number>;
    stringVariationDetail(
      flagKey: string,
      fallback: string,
    ): Promise<VariationDetail<string> | string>;
    jsonVariationDetail(
      flagKey: string,
      fallback: Record<string, any>,
    ): Promise<VariationDetail<Record<string, any>> | Record<string, any>>;
    allFlags(): Promise<T>;
    track(eventName: string, data: any, metricValue: number): void;
    setOffline(): Promise<boolean>;
    isOffline(): Promise<boolean>;
    setOnline(): Promise<boolean>;
    isInitialized(): Promise<boolean>;
    flush(): void;
    close(): void;
    identify(userConfig: LDUserConfig): Promise<null>;
    isDisableBackgroundPolling(): Promise<boolean>;
    registerFeatureFlagListener(
      flagKey: string,
      callback: (flagKey: string) => void,
    ): void;
    unregisterFeatureFlagListener(
      flagKey: string,
      callback: (flagKey: string) => void,
    ): void;
    getConnectionInformation(): any;
    registerCurrentConnectionModeListener(
      listenerId: string,
      callback: (connectionMode: string) => void,
    ): void;
    unregisterCurrentConnectionModeListener(listenerId: string): void;
    registerAllFlagsListener(
      listenerId: string,
      callback: (updatedFlags: string[]) => void,
    ): void;
    unregisterAllFlagsListener(listenerId: string): void;
  }
}

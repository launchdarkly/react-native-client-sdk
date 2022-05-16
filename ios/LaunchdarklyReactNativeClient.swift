import Foundation
import LaunchDarkly

@objc(LaunchdarklyReactNativeClient)
class LaunchdarklyReactNativeClient: RCTEventEmitter {
    private let FLAG_PREFIX = "LaunchDarkly-Flag-"
    private let ALL_FLAGS_PREFIX = "LaunchDarkly-All-Flags-"
    private let CONNECTION_MODE_PREFIX = "LaunchDarkly-Connection-Mode-"
    private let ERROR_INIT = "E_INITIALIZE"
    private let ERROR_IDENTIFY = "E_IDENTIFY"
    private let ERROR_UNKNOWN = "E_UNKNOWN"

    private var flagListenerOwners: [String: ObserverOwner] = [:]
    private var allFlagsListenerOwners: [String: ObserverOwner] = [:]
    private var connectionModeListenerOwners: [String: ObserverOwner] = [:]

    override func supportedEvents() -> [String]! {
        return [FLAG_PREFIX, ALL_FLAGS_PREFIX, CONNECTION_MODE_PREFIX]
    }
    
    override func constantsToExport() -> [AnyHashable: Any] {
        return ["FLAG_PREFIX": FLAG_PREFIX, "ALL_FLAGS_PREFIX": ALL_FLAGS_PREFIX, "CONNECTION_MODE_PREFIX": CONNECTION_MODE_PREFIX]
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func configure(_ config: NSDictionary, user: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        internalConfigure(config: config, user: user, timeout: nil, resolve: resolve, reject: reject)
    }

    @objc func configureWithTimeout(_ config: NSDictionary, user: NSDictionary, timeout: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        internalConfigure(config: config, user: user, timeout: timeout, resolve: resolve, reject: reject)
    }

    private func internalConfigure(config: NSDictionary, user: NSDictionary, timeout: Int?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let config = configBuild(config: config)

        if let config = config {
            if let timeoutUnwrapped = timeout {
                let startWaitSeconds: TimeInterval = Double(timeoutUnwrapped)
                LDClient.start(config: config, user: userBuild(user), startWaitSeconds: startWaitSeconds) { timedOut in
                    if timedOut {
                        reject(self.ERROR_INIT, "SDK initialization timed out", nil)
                    } else {
                        resolve(nil)
                    }
                }
            } else {
                LDClient.start(config: config, user: userBuild(user), completion: {() -> Void in
                    resolve(nil)
                })
            }
        }
    }

    private func id<T>(_ x: T) -> T { x }
    private func millis(_ x: NSNumber) -> TimeInterval { TimeInterval(x.doubleValue / 1_000) }
    private func url(_ x: String) -> URL { URL.init(string: x)! }
    private func configField<T,V>(_ field: inout T, _ value: Any?, _ transform: ((V) -> T?)) {
        if let val = value as? V, let res = transform(val) {
            field = res
        }
    }
    
    private func configBuild(config: NSDictionary) -> LDConfig? {
        guard let mobileKey = config["mobileKey"] as? String
        else { return nil }

        var ldConfig = LDConfig(mobileKey: mobileKey)
        configField(&ldConfig.baseUrl, config["pollUri"], url)
        configField(&ldConfig.eventsUrl, config["eventsUri"], url)
        configField(&ldConfig.streamUrl, config["streamUri"], url)
        configField(&ldConfig.eventCapacity, config["eventsCapacity"], { (x: NSNumber) in x.intValue })
        configField(&ldConfig.eventFlushInterval, config["eventsFlushIntervalMillis"], millis)
        configField(&ldConfig.connectionTimeout, config["connectionTimeoutMillis"], millis)
        configField(&ldConfig.flagPollingInterval, config["pollingIntervalMillis"], millis)
        configField(&ldConfig.backgroundFlagPollingInterval, config["backgroundPollingIntervalMillis"], millis)
        configField(&ldConfig.useReport, config["useReport"], id)
        configField(&ldConfig.streamingMode, config["stream"], { $0 ? .streaming : .polling })
        configField(&ldConfig.enableBackgroundUpdates, config["disableBackgroundUpdating"], { !$0 })
        configField(&ldConfig.startOnline, config["offline"], { !$0 })
        configField(&ldConfig.isDebugMode, config["debugMode"], id)
        configField(&ldConfig.evaluationReasons, config["evaluationReasons"], id)
        configField(&ldConfig.wrapperName, config["wrapperName"], id)
        configField(&ldConfig.wrapperVersion, config["wrapperVersion"], id)
        configField(&ldConfig.maxCachedUsers, config["maxCachedUsers"], { (x: NSNumber) in x.intValue })
        configField(&ldConfig.diagnosticOptOut, config["diagnosticOptOut"], id)
        configField(&ldConfig.diagnosticRecordingInterval, config["diagnosticRecordingIntervalMillis"], millis)
        configField(&ldConfig.allUserAttributesPrivate, config["allUserAttributesPrivate"], id)
        configField(&ldConfig.autoAliasingOptOut, config["autoAliasingOptOut"], id)
        configField(&ldConfig.inlineUserInEvents, config["inlineUsersInEvents"], id)
        configField(&ldConfig.privateUserAttributes, config["privateAttributeNames"], { (x: [String]) in x.map { UserAttribute.forName($0) }})

        if let val = config["secondaryMobileKeys"] as? [String: String] {
            try! ldConfig.setSecondaryMobileKeys(val)
        }

        return ldConfig
    }

    private func userBuild(_ userDict: NSDictionary) -> LDUser {
        var user = LDUser(key: userDict["key"] as? String)
        if let anon = userDict["anonymous"] as? Bool, anon {
            user.isAnonymous = true
        }
        user.secondary = userDict["secondary"] as? String
        user.name = userDict["name"] as? String
        user.firstName = userDict["firstName"] as? String
        user.lastName = userDict["lastName"] as? String
        user.email = userDict["email"] as? String
        user.country = userDict["country"] as? String
        user.ipAddress = userDict["ip"] as? String
        user.avatar = userDict["avatar"] as? String
        let privateNames = userDict["privateAttributeNames"] as? [String] ?? []
        user.privateAttributes = privateNames.map { UserAttribute.forName($0) }
        user.custom = (userDict["custom"] as? [String: Any] ?? [:]).mapValues { LDValue.fromBridge($0) }
        return user
    }

    @objc func boolVariation(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.boolVariation(forKey: flagKey, defaultValue: defaultValue.boolValue))
    }

    @objc func numberVariation(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.doubleVariation(forKey: flagKey, defaultValue: defaultValue))
    }

    @objc func stringVariation(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.stringVariation(forKey: flagKey, defaultValue: defaultValue))
    }

    @objc func jsonVariation(_ flagKey: String, defaultValue: Any, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.jsonVariation(forKey: flagKey, defaultValue: LDValue.fromBridge(defaultValue)).toBridge())
    }

    @objc func boolVariationDetail(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = LDClient.get(environment: environment)!.boolVariationDetail(forKey: flagKey, defaultValue: defaultValue.boolValue)
        resolve(bridgeDetail(detail, id))
    }

    @objc func numberVariationDetail(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = LDClient.get(environment: environment)!.doubleVariationDetail(forKey: flagKey, defaultValue: defaultValue)
        resolve(bridgeDetail(detail, id))
    }

    @objc func stringVariationDetail(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = LDClient.get(environment: environment)!.stringVariationDetail(forKey: flagKey, defaultValue: defaultValue)
        resolve(bridgeDetail(detail, id))
    }

    @objc func jsonVariationDetail(_ flagKey: String, defaultValue: Any, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = LDClient.get(environment: environment)!.jsonVariationDetail(forKey: flagKey, defaultValue: LDValue.fromBridge(defaultValue))
        resolve(bridgeDetail(detail, { $0.toBridge() }))
    }

    private func bridgeDetail<T>(_ detail: LDEvaluationDetail<T>, _ converter: ((T) -> Any)) -> NSDictionary {
        [ "value": converter(detail.value)
        , "variationIndex": (detail.variationIndex as Any)
        , "reason": ((detail.reason?.mapValues { $0.toBridge() }) as Any)
        ]
    }

    @objc func trackData(_ eventName: String, data: Any, environment: String) {
        LDClient.get(environment: environment)!.track(key: eventName, data: LDValue.fromBridge(data))
    }

    @objc func trackMetricValue(_ eventName: String, data: Any, metricValue: NSNumber, environment: String) {
        LDClient.get(environment: environment)!.track(key: eventName, data: LDValue.fromBridge(data), metricValue: Double(truncating: metricValue))
    }

    @objc func setOffline(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        LDClient.get()?.setOnline(false) {
            resolve(true)
        }
    }

    @objc func isOffline(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(!(LDClient.get()?.isOnline ?? false))
    }

    @objc func setOnline(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        LDClient.get()?.setOnline(true) {
            resolve(true)
        }
    }

    @objc func flush() {
        LDClient.get()?.flush()
    }

    @objc func close(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        LDClient.get()?.close()
        resolve(true)
    }

    @objc func identify(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        LDClient.get()?.identify(user: userBuild(options)) {
            resolve(nil)
        }
    }

    @objc func alias(_ environment: String, user: NSDictionary, previousUser: NSDictionary) {
        LDClient.get(environment: environment)!.alias(context: userBuild(user), previousContext: userBuild(previousUser))
    }

    @objc func allFlags(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.allFlags?.mapValues { $0.toBridge() } ?? [:] as NSDictionary)
    }

    @objc func getConnectionMode(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let connectionInformation = LDClient.get(environment: environment)!.getConnectionInformation()
        var connectionMode: String
        switch connectionInformation.currentConnectionMode {
        case .streaming:
            connectionMode = "STREAMING"
        case .polling:
            connectionMode = "POLLING"
        case .offline:
            connectionMode = "OFFLINE"
        case .establishingStreamingConnection:
            connectionMode = "ESTABLISHING_STREAMING_CONNECTION"
        }
        resolve(connectionMode)
    }

    // lastKnownFlagValidity is nil if either no connection has ever been successfully made or if the SDK has an active streaming connection. It will have a value if 1) in polling mode and at least one poll has completed successfully, or 2) if in streaming mode whenever the streaming connection closes.
    @objc func getLastSuccessfulConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.getConnectionInformation().lastKnownFlagValidity ?? 0)
    }

    @objc func getLastFailedConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(LDClient.get(environment: environment)!.getConnectionInformation().lastFailedConnection ?? 0)
    }

    @objc func getLastFailure(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let connectionInformation = LDClient.get(environment: environment)!.getConnectionInformation()
        var failureReason: String
        switch connectionInformation.lastConnectionFailureReason {
        case .unauthorized:
            failureReason = "UNAUTHORIZED"
        case .none:
            failureReason = "NONE"
        case .httpError:
            failureReason = "HTTP_ERROR"
        case .unknownError:
            failureReason = "UNKNOWN_ERROR"
        }
        resolve(failureReason)
    }

    private func envConcat(environment: String, identifier: String) -> String {
        return environment + ";" + identifier
    }

    @objc func registerFeatureFlagListener(_ flagKey: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: flagKey)
        let owner = ObserverOwner()
        flagListenerOwners[multiListenerId] = owner
        LDClient.get(environment: environment)!.observe(key: flagKey, owner: owner) { changedFlag in
            if self.bridge != nil {
                self.sendEvent(withName: self.FLAG_PREFIX, body: ["flagKey": changedFlag.key, "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterFeatureFlagListener(_ flagKey: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: flagKey)
        if let owner = flagListenerOwners.removeValue(forKey: multiListenerId) {
            LDClient.get(environment: environment)!.stopObserving(owner: owner)
        }
    }

    @objc func registerCurrentConnectionModeListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let owner = ObserverOwner()
        connectionModeListenerOwners[multiListenerId] = owner
        LDClient.get(environment: environment)!.observeCurrentConnectionMode(owner: owner) { connectionMode in
            if self.bridge != nil {
                self.sendEvent(withName: self.CONNECTION_MODE_PREFIX, body: ["connectionMode": connectionMode, "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterCurrentConnectionModeListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        if let owner = connectionModeListenerOwners.removeValue(forKey: multiListenerId) {
            LDClient.get(environment: environment)!.stopObserving(owner: owner)
        }
    }

    @objc func registerAllFlagsListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let owner = ObserverOwner()
        allFlagsListenerOwners[multiListenerId] = owner
        LDClient.get(environment: environment)!.observeAll(owner: owner) { changedFlags in
            if self.bridge != nil {
                self.sendEvent(withName: self.ALL_FLAGS_PREFIX, body: ["flagKeys": Array(changedFlags.keys), "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterAllFlagsListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        if let owner = allFlagsListenerOwners.removeValue(forKey: multiListenerId) {
            LDClient.get(environment: environment)!.stopObserving(owner: owner)
        }
    }

    @objc func isInitialized(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if LDClient.get() == nil {
            reject(ERROR_UNKNOWN, "SDK has not been configured", nil)
        } else if let client = LDClient.get(environment: environment) {
            resolve(client.isInitialized)
        } else {
            reject(ERROR_UNKNOWN, "SDK not configured with requested environment", nil)
        }
    }
}

class ObserverOwner{}

extension LDValue {
    static func fromBridge(_ value: Any) -> LDValue {
        guard !(value is NSNull)
        else { return .null }
        if let nsNumValue = value as? NSNumber {
            // Because we accept `LDValue` in contexts that can receive anything, the value is a
            // reference type in Objective-C. Because of that, RN bridges the type as a `NSNumber`,
            // so we must determine whether that `NSNumber` was originally created from a `BOOL`.
            // Adapted from https://stackoverflow.com/a/30223989
            let boolTypeId = CFBooleanGetTypeID()
            if CFGetTypeID(nsNumValue) == boolTypeId {
                return .bool(nsNumValue.boolValue)
            } else {
                return .number(Double(truncating: nsNumValue))
            }
        }
        if let stringValue = value as? String { return .string(stringValue) }
        if let arrayValue = value as? [Any] { return .array(arrayValue.map { fromBridge($0) }) }
        if let dictValue = value as? [String: Any] { return .object(dictValue.mapValues { fromBridge($0) }) }
        return .null
    }

    func toBridge() -> Any {
        switch self {
        case .null: return NSNull()
        case .bool(let boolValue): return boolValue
        case .number(let numValue): return numValue
        case .string(let stringValue): return stringValue
        case .array(let arrayValue): return arrayValue.map { $0.toBridge() }
        case .object(let objectValue): return objectValue.mapValues { $0.toBridge() }
        }
    }
}

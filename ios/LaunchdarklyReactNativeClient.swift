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

    @objc func configure(_ config: NSDictionary, context: NSDictionary, isContext: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        internalConfigure(config: config, context: context, timeout: nil, isContext: isContext, resolve: resolve, reject: reject)
    }

    @objc func configureWithTimeout(_ config: NSDictionary, context: NSDictionary, timeout: Int, isContext: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        internalConfigure(config: config, context: context, timeout: timeout, isContext: isContext, resolve: resolve, reject: reject)
    }

    private func getLDClient(environment: String) -> LDClient? {
        if let client = LDClient.get(environment: environment) {
            return client
        } else {
            NSLog("%@", "WARNING: LDClient is nil for env: '\(environment)'")
            return nil
        }
    }

    private func internalConfigure(config: NSDictionary, context: NSDictionary, timeout: Int?, isContext: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let config = configBuild(config: config)

        if let config = config {
            do {
                if let timeoutUnwrapped = timeout {
                    let startWaitSeconds: TimeInterval = Double(timeoutUnwrapped)

                    if(isContext) {
                        LDClient.start(config: config, context: try contextBuild(context), startWaitSeconds: startWaitSeconds) { timedOut in
                            if timedOut {
                                reject(self.ERROR_INIT, "SDK initialization timed out", nil)
                            } else {
                                resolve(nil)
                            }
                        }
                    } else {
                        LDClient.start(config: config, user: userBuild(context), startWaitSeconds: startWaitSeconds) { timedOut in
                            if timedOut {
                                reject(self.ERROR_INIT, "SDK initialization timed out", nil)
                            } else {
                                resolve(nil)
                            }
                        }
                    }
                } else {
                    if(isContext) {
                        LDClient.start(config: config, context: try contextBuild(context), completion: {() -> Void in
                            resolve(nil)
                        })
                    } else {
                        LDClient.start(config: config, user: userBuild(context), completion: {() -> Void in
                            resolve(nil)
                        })
                    }
                }
            }
            catch {
                NSLog("LDClient init failed: \(error)")
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

    internal func configBuild(config: NSDictionary) -> LDConfig? {
        guard let mobileKey = config["mobileKey"] as? String
        else { return nil }

        var ldConfig = LDConfig(mobileKey: mobileKey)
        configField(&ldConfig.baseUrl, config["pollUrl"], url)
        configField(&ldConfig.eventsUrl, config["eventsUrl"], url)
        configField(&ldConfig.streamUrl, config["streamUrl"], url)
        configField(&ldConfig.eventCapacity, config["eventCapacity"], { (x: NSNumber) in x.intValue })
        configField(&ldConfig.eventFlushInterval, config["flushInterval"], millis)
        configField(&ldConfig.connectionTimeout, config["connectionTimeout"], millis)
        configField(&ldConfig.flagPollingInterval, config["pollingInterval"], millis)
        configField(&ldConfig.backgroundFlagPollingInterval, config["backgroundPollingInterval"], millis)
        configField(&ldConfig.useReport, config["useReport"], id)
        configField(&ldConfig.streamingMode, config["stream"], { $0 ? .streaming : .polling })
        configField(&ldConfig.enableBackgroundUpdates, config["disableBackgroundUpdating"], { !$0 })
        configField(&ldConfig.startOnline, config["offline"], { !$0 })
        configField(&ldConfig.isDebugMode, config["debugMode"], id)
        configField(&ldConfig.evaluationReasons, config["evaluationReasons"], id)
        configField(&ldConfig.wrapperName, config["wrapperName"], id)
        configField(&ldConfig.wrapperVersion, config["wrapperVersion"], id)
        configField(&ldConfig.maxCachedContexts, config["maxCachedContexts"], { (x: NSNumber) in x.intValue })
        configField(&ldConfig.diagnosticOptOut, config["diagnosticOptOut"], id)
        configField(&ldConfig.diagnosticRecordingInterval, config["diagnosticRecordingInterval"], millis)
        configField(&ldConfig.allContextAttributesPrivate, config["allAttributesPrivate"], id)
        configField(&ldConfig.privateContextAttributes, config["privateAttributes"], { (x: [String]) in x.map { Reference($0) }})

        if let val = config["secondaryMobileKeys"] as? [String: String] {
            try! ldConfig.setSecondaryMobileKeys(val)
        }

        if let c = config["application"] as? [String: String] {
            var applicationInfo = ApplicationInfo()

            if let applicationId = c["id"] {
                applicationInfo.applicationIdentifier(applicationId)
            }

            if let applicationVersion = c["version"] {
                applicationInfo.applicationVersion(applicationVersion)
            }

            ldConfig.applicationInfo = applicationInfo
        }

        return ldConfig
    }

    internal func createSingleContext(_ contextDict: NSDictionary, _ kind: String) throws -> LDContext {
        var b = LDContextBuilder()
        b.kind(kind)

        if let key = contextDict["key"] as? String {
            b.key(key)
        }

        if let meta = contextDict["_meta"] as? NSDictionary {
            if let privateAttributes = meta["privateAttributes"] as? [String] {
                privateAttributes.forEach {
                    b.addPrivateAttribute(Reference($0))
                }
            }
        }

        // set name, anonymous and arbitrary attributes
        for (k, value) in contextDict as! [String: Any] {
            if (k != "kind" && k != "key" && k != "_meta") {
                b.trySetValue(k, LDValue.fromBridge(value))

            }
        }

        return try b.build().get()
    }

    internal func contextBuild(_ contextDict: NSDictionary) throws -> LDContext {
        let kind = contextDict["kind"] as! String

        if (kind == "multi") {
            var b = LDMultiContextBuilder()

            try contextDict.allKeys.forEach {
                let kk = $0 as! String
                if (kk != "kind") {
                    let v = contextDict[kk] as! NSDictionary
                    b.addContext(try createSingleContext(v, kk))
                }
            }

            let c = try b.build().get()
            return c
        } else {
            let c = try createSingleContext(contextDict, kind)
            return c
        }
    }

    private func userBuild(_ userDict: NSDictionary) -> LDUser {
        var user = LDUser(key: userDict["key"] as? String)
        if let anon = userDict["anonymous"] as? Bool {
            user.isAnonymous = anon
        }
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
        if let ldClient = getLDClient(environment: environment) {
            resolve(ldClient.boolVariation(forKey: flagKey, defaultValue: defaultValue.boolValue))
        } else {
            NSLog("%@", "evaluation failed because LDClient is nil. Returning default value.")
            resolve(defaultValue.boolValue)
        }
    }

    @objc func numberVariation(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if let ldClient = getLDClient(environment: environment) {
            resolve(ldClient.doubleVariation(forKey: flagKey, defaultValue: defaultValue))
        } else {
            NSLog("%@", "evaluation failed because LDClient is nil. Returning default value.")
            resolve(defaultValue)
        }
    }

    @objc func stringVariation(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if let ldClient = getLDClient(environment: environment) {
            resolve(ldClient.stringVariation(forKey: flagKey, defaultValue: defaultValue))
        } else {
            NSLog("%@", "evaluation failed because LDClient is nil. Returning default value.")
            resolve(defaultValue)
        }
    }

    @objc func jsonVariation(_ flagKey: String, defaultValue: Any, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if let ldClient = getLDClient(environment: environment) {
            resolve(ldClient.jsonVariation(forKey: flagKey, defaultValue: LDValue.fromBridge(defaultValue)).toBridge())
        } else {
            NSLog("%@", "evaluation failed because LDClient is nil. Returning default value.")
            resolve(LDValue.fromBridge(defaultValue))
        }
    }

    @objc func boolVariationDetail(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = LDClient.get(environment: environment)?.boolVariationDetail(forKey: flagKey, defaultValue: defaultValue.boolValue)
        resolve(bridgeDetail(detail, id, defaultValue.boolValue))
    }

    @objc func numberVariationDetail(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = getLDClient(environment: environment)?.doubleVariationDetail(forKey: flagKey, defaultValue: defaultValue)
        resolve(bridgeDetail(detail, id, defaultValue))
    }

    @objc func stringVariationDetail(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = getLDClient(environment: environment)?.stringVariationDetail(forKey: flagKey, defaultValue: defaultValue)
        resolve(bridgeDetail(detail, id, defaultValue))
    }

    @objc func jsonVariationDetail(_ flagKey: String, defaultValue: Any, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let detail = getLDClient(environment: environment)?.jsonVariationDetail(forKey: flagKey, defaultValue: LDValue.fromBridge(defaultValue))
        resolve(bridgeDetail(detail, { $0.toBridge() }, LDValue.fromBridge(defaultValue)))
    }

    private func bridgeDetail<T>(_ detail: LDEvaluationDetail<T>? = nil, _ converter: ((T) -> Any), _ defaultValue: T) -> NSDictionary {
        if let detail = detail {
            return [ "value": converter(detail.value)
                     , "variationIndex": (detail.variationIndex as Any)
                     , "reason": ((detail.reason?.mapValues { $0.toBridge() }) as Any)
            ]
        }

        NSLog("%@", "WARNING: evaluation failed because LDClient is nil")
        return [ "value": converter(defaultValue)
                 , "reason": ["error": LDValue(stringLiteral: "evaluation failed because LDClient is nil. Returning default value.")]
        ]
    }

    @objc func trackData(_ eventName: String, data: Any, environment: String) {
        getLDClient(environment: environment)?.track(key: eventName, data: LDValue.fromBridge(data))
    }

    @objc func trackMetricValue(_ eventName: String, data: Any, metricValue: NSNumber, environment: String) {
        getLDClient(environment: environment)?.track(key: eventName, data: LDValue.fromBridge(data), metricValue: Double(truncating: metricValue))
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

    @objc func identify(_ context: NSDictionary, isContext: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            if(isContext) {
                LDClient.get()?.identify(context: try contextBuild(context)) {
                    resolve(nil)
                }
            } else {
                LDClient.get()?.identify(user: userBuild(context)) {
                    resolve(nil)
                }
            }
        }
        catch {
            NSLog("LDClient identify failed: \(error)")
        }
    }

    @objc func allFlags(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(getLDClient(environment: environment)?.allFlags?.mapValues { $0.toBridge() } ?? [:] as NSDictionary)
    }

    @objc func getConnectionMode(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if let connectionInformation = getLDClient(environment: environment)?.getConnectionInformation() {
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
        } else {
            resolve(nil)
        }
    }

    // lastKnownFlagValidity is nil if either no connection has ever been successfully made or if the SDK has an active streaming connection. It will have a value if 1) in polling mode and at least one poll has completed successfully, or 2) if in streaming mode whenever the streaming connection closes.
    @objc func getLastSuccessfulConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(getLDClient(environment: environment)?.getConnectionInformation().lastKnownFlagValidity ?? 0)
    }

    @objc func getLastFailedConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(getLDClient(environment: environment)?.getConnectionInformation().lastFailedConnection ?? 0)
    }

    @objc func getLastFailure(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if let connectionInformation = getLDClient(environment: environment)?.getConnectionInformation() {
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
        } else {
            resolve(nil)
        }
    }

    private func envConcat(environment: String, identifier: String) -> String {
        return environment + ";" + identifier
    }

    @objc func registerFeatureFlagListener(_ flagKey: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: flagKey)
        let owner = ObserverOwner()
        flagListenerOwners[multiListenerId] = owner
        getLDClient(environment: environment)?.observe(key: flagKey, owner: owner) { changedFlag in
            if self.bridge != nil {
                self.sendEvent(withName: self.FLAG_PREFIX, body: ["flagKey": changedFlag.key, "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterFeatureFlagListener(_ flagKey: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: flagKey)
        if let owner = flagListenerOwners.removeValue(forKey: multiListenerId) {
            getLDClient(environment: environment)?.stopObserving(owner: owner)
        }
    }

    @objc func registerCurrentConnectionModeListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let owner = ObserverOwner()
        connectionModeListenerOwners[multiListenerId] = owner
        getLDClient(environment: environment)?.observeCurrentConnectionMode(owner: owner) { connectionMode in
            if self.bridge != nil {
                self.sendEvent(withName: self.CONNECTION_MODE_PREFIX, body: ["connectionMode": connectionMode, "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterCurrentConnectionModeListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        if let owner = connectionModeListenerOwners.removeValue(forKey: multiListenerId) {
            getLDClient(environment: environment)?.stopObserving(owner: owner)
        }
    }

    @objc func registerAllFlagsListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let owner = ObserverOwner()
        allFlagsListenerOwners[multiListenerId] = owner
        getLDClient(environment: environment)?.observeAll(owner: owner) { changedFlags in
            if self.bridge != nil {
                self.sendEvent(withName: self.ALL_FLAGS_PREFIX, body: ["flagKeys": Array(changedFlags.keys), "listenerId": multiListenerId])
            }
        }
    }

    @objc func unregisterAllFlagsListener(_ listenerId: String, environment: String) {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        if let owner = allFlagsListenerOwners.removeValue(forKey: multiListenerId) {
            getLDClient(environment: environment)?.stopObserving(owner: owner)
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

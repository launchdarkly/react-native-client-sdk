import Foundation
import LaunchDarkly

@objc(LaunchdarklyReactNativeClient)
class LaunchdarklyReactNativeClient: RCTEventEmitter {
    private var listenerKeys: [String:LDObserverOwner] = [:]
    
    private let FLAG_PREFIX = "LaunchDarkly-Flag-"
    private let ALL_FLAGS_PREFIX = "LaunchDarkly-All-Flags-"
    private let CONNECTION_MODE_PREFIX = "LaunchDarkly-Connection-Mode-"
    private let ERROR_INIT = "E_INITIALIZE"
    private let ERROR_IDENTIFY = "E_IDENTIFY"
    private let ERROR_UNKNOWN = "E_UNKNOWN"
    
    override func supportedEvents() -> [String]! {
        return [FLAG_PREFIX, ALL_FLAGS_PREFIX, CONNECTION_MODE_PREFIX]
    }
    
    override func constantsToExport() -> [AnyHashable: Any] {
        return ["FLAG_PREFIX": FLAG_PREFIX, "ALL_FLAGS_PREFIX": ALL_FLAGS_PREFIX, "CONNECTION_MODE_PREFIX": CONNECTION_MODE_PREFIX]
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func configure(_ config: NSDictionary, user: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        internalConfigure(config: config, user: user, timeout: nil, resolve: resolve, reject: reject)
    }

    @objc func configureWithTimeout(_ config: NSDictionary, user: NSDictionary, timeout: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        internalConfigure(config: config, user: user, timeout: timeout, resolve: resolve, reject: reject)
    }

    private func internalConfigure(config: NSDictionary, user: NSDictionary, timeout: Int?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
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
        user.privateAttributes = userDict["privateAttributeNames"] as? [String]
        user.custom = userDict["custom"] as? [String: Any]
        return user
    }
    
    @objc func boolVariation(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue.boolValue) as Bool)
    }
    
    @objc func numberVariation(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as Double)
    }
    
    @objc func stringVariation(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as String)
    }
    
    @objc func jsonVariationNone(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let jsonFlagValue: Dictionary<String, Any>? = LDClient.get(environment: environment)!.variation(forKey: flagKey)
        resolve(jsonFlagValue)
    }

    @objc func jsonVariationNumber(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as Double)
    }

    @objc func jsonVariationBool(_ flagKey: String, defaultValue: Bool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as Bool)
    }

    @objc func jsonVariationString(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as String)
    }

    @objc func jsonVariationArray(_ flagKey: String, defaultValue: Array<RCTConvert>, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as Array)
    }

    @objc func jsonVariationObject(_ flagKey: String, defaultValue: NSDictionary, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue.swiftDictionary) as NSDictionary)
    }
    
    @objc func boolVariationDetail(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue.boolValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func numberVariationDetail(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func stringVariationDetail(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailNone(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail: LDEvaluationDetail<Dictionary<String, Any>?> = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailNumber(_ flagKey: String, defaultValue: Double, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailBool(_ flagKey: String, defaultValue: Bool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailString(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailArray(_ flagKey: String, defaultValue: Array<RCTConvert>, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func jsonVariationDetailObject(_ flagKey: String, defaultValue: NSDictionary, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue.swiftDictionary)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }

    @objc func trackNumber(_ eventName: String, data: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data)
    }

    @objc func trackBool(_ eventName: String, data: ObjCBool, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data.boolValue)
    }

    @objc func trackString(_ eventName: String, data: String, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data)
    }

    @objc func trackArray(_ eventName: String, data: NSArray, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data)
    }

    @objc func trackObject(_ eventName: String, data: NSDictionary, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data.swiftDictionary)
    }

    @objc func track(_ eventName: String, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName)
    }
    
    @objc func trackNumberMetricValue(_ eventName: String, data: NSNumber, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data, metricValue: Double(truncating: metricValue))
    }
    
    @objc func trackBoolMetricValue(_ eventName: String, data: ObjCBool, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data.boolValue, metricValue: Double(truncating: metricValue))
    }
    
    @objc func trackStringMetricValue(_ eventName: String, data: String, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data, metricValue: Double(truncating: metricValue))
    }
    
    @objc func trackArrayMetricValue(_ eventName: String, data: NSArray, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data, metricValue: Double(truncating: metricValue))
    }
    
    @objc func trackObjectMetricValue(_ eventName: String, data: NSDictionary, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, data: data.swiftDictionary, metricValue: Double(truncating: metricValue))
    }
    
    @objc func trackMetricValue(_ eventName: String, metricValue: NSNumber, environment: String) -> Void {
        try? LDClient.get(environment: environment)!.track(key: eventName, metricValue: Double(truncating: metricValue))
    }

    @objc func setOffline(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()?.setOnline(false) {
            return resolve(true)
        }
    }
    
    @objc func isOffline(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(!(LDClient.get()?.isOnline ?? false))
    }
    
    @objc func setOnline(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()?.setOnline(true) {
            return resolve(true)
        }
    }
    
    @objc func flush() -> Void {
        LDClient.get()?.flush()
    }
    
    @objc func close(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()?.close()
        resolve(true)
    }
    
    @objc func identify(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()?.identify(user: userBuild(options)) {
            resolve(nil)
        }
    }

    @objc func alias(_ environment: String, user: NSDictionary, previousUser: NSDictionary) -> Void {
        LDClient.get(environment: environment)!.alias(context: userBuild(user), previousContext: userBuild(previousUser))
    }
    
    @objc func allFlags(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var allFlagsDict: [String: Any] = [:]
        if let allFlags = LDClient.get(environment: environment)!.allFlags {
            for (key, value) in allFlags {
                allFlagsDict[key] = value
            }
        }
        resolve(allFlagsDict as NSDictionary)
    }
    
    @objc func getConnectionMode(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
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
    @objc func getLastSuccessfulConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.getConnectionInformation().lastKnownFlagValidity ?? 0)
    }

    @objc func getLastFailedConnection(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.getConnectionInformation().lastFailedConnection ?? 0)
    }

    @objc func getLastFailure(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
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

    @objc func registerFeatureFlagListener(_ flagKey: String, environment: String) -> Void {
        let multiListenerId = envConcat(environment: environment, identifier: flagKey)
        let flagChangeOwner = multiListenerId as LDObserverOwner
        listenerKeys[multiListenerId] = flagChangeOwner
        LDClient.get(environment: environment)!.observe(key: flagKey, owner: flagChangeOwner, handler: { changedFlag in
            if self.bridge != nil {
                self.sendEvent(withName: self.FLAG_PREFIX, body: ["flagKey": changedFlag.key, "listenerId": multiListenerId])
            }
        })
    }
    
    private func unregisterListener(_ key: String, _ environment: String) -> Void {
        let multiListenerId = envConcat(environment: environment, identifier: key)
        let owner = multiListenerId as LDObserverOwner
        if listenerKeys.removeValue(forKey: multiListenerId) != nil {
            LDClient.get(environment: environment)!.stopObserving(owner: owner)
        }
    }
    
    @objc func unregisterFeatureFlagListener(_ flagKey: String, environment: String) -> Void {
        unregisterListener(flagKey, environment)
    }
    
    @objc func registerCurrentConnectionModeListener(_ listenerId: String, environment: String) -> Void {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let currentConnectionModeOwner = multiListenerId as LDObserverOwner
        LDClient.get(environment: environment)!.observeCurrentConnectionMode(owner: currentConnectionModeOwner, handler: { connectionMode in
            if self.bridge != nil {
                self.sendEvent(withName: self.CONNECTION_MODE_PREFIX, body: ["connectionMode": connectionMode, "listenerId": multiListenerId])
            }
        })
    }
    
    @objc func unregisterCurrentConnectionModeListener(_ listenerId: String, environment: String) -> Void {
        unregisterListener(listenerId, environment)
    }
    
    @objc func registerAllFlagsListener(_ listenerId: String, environment: String) -> Void {
        let multiListenerId = envConcat(environment: environment, identifier: listenerId)
        let flagChangeOwner = multiListenerId as LDObserverOwner
        LDClient.get(environment: environment)!.observeAll(owner: flagChangeOwner, handler: { changedFlags in
            if self.bridge != nil {
                self.sendEvent(withName: self.ALL_FLAGS_PREFIX, body: ["flagKeys": Array(changedFlags.keys), "listenerId": multiListenerId])
            }
        })
    }
    
    @objc func unregisterAllFlagsListener(_ listenerId: String, environment: String) -> Void {
        unregisterListener(listenerId, environment)
    }

    @objc func isInitialized(_ environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if LDClient.get() == nil {
            reject(ERROR_UNKNOWN, "SDK has not been configured", nil)
        } else if let client = LDClient.get(environment: environment) {
            resolve(client.isInitialized)
        } else {
            reject(ERROR_UNKNOWN, "SDK not configured with requested environment", nil)
        }
    }
}

extension NSDictionary {
    @objc var swiftDictionary: Dictionary<String, Any> {
        var swiftDictionary = Dictionary<String, Any>()
        
        for key : Any in self.allKeys {
            let stringKey = key as! String
            if let keyValue = self.value(forKey: stringKey) {
                swiftDictionary[stringKey] = keyValue
            }
        }
        
        return swiftDictionary;
    }
}

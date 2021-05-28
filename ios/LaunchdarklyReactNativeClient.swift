
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
        let user = userBuild(userDict: user)

        if config != nil && user != nil {
            if let timeoutUnwrapped = timeout {
                let startWaitSeconds: TimeInterval = Double(timeoutUnwrapped)
                LDClient.start(config: config!, user: user, startWaitSeconds: startWaitSeconds) { timedOut in
                    if timedOut {
                        reject(self.ERROR_INIT, "SDK initialization timed out", nil)
                    } else {
                        resolve(nil)
                    }
                }
            } else {
                LDClient.start(config: config!, user: user, completion: {() -> Void in 
                    resolve(nil)
                })
            }
        }
    }
    
    private func configBuild(config: NSDictionary) -> LDConfig? {
        let mobileKey = config["mobileKey"]
        
        if mobileKey == nil || !(mobileKey is String) {
            return nil
        }
        
        let safeKey = mobileKey as! String
        var ldConfig = LDConfig(mobileKey: safeKey)
        
        if config["pollUri"] != nil  {
            ldConfig.baseUrl = URL.init(string: config["pollUri"] as! String)!
        }
        
        if config["eventsUri"] != nil  {
            ldConfig.eventsUrl = URL.init(string: config["eventsUri"] as! String)!
        }
        
        if config["streamUri"] != nil  {
            ldConfig.streamUrl = URL.init(string: config["streamUri"] as! String)!
        }
        
        if config["eventsCapacity"] != nil  {
            ldConfig.eventCapacity = config["eventsCapacity"] as! Int
        }
        
        if config["eventsFlushIntervalMillis"] != nil  {
            ldConfig.eventFlushInterval = TimeInterval(config["eventsFlushIntervalMillis"] as! Float / 1000)
        }
        
        if config["connectionTimeoutMillis"] != nil  {
            ldConfig.connectionTimeout = TimeInterval(config["connectionTimeoutMillis"] as! Float / 1000)
        }
        
        if config["pollingIntervalMillis"] != nil  {
            ldConfig.flagPollingInterval = TimeInterval(config["pollingIntervalMillis"] as! Float / 1000)
        }
        
        if config["backgroundPollingIntervalMillis"] != nil  {
            ldConfig.backgroundFlagPollingInterval = TimeInterval(config["backgroundPollingIntervalMillis"] as! Float / 1000)
        }
        
        if config["useReport"] != nil  {
            ldConfig.useReport = config["useReport"] as! Bool
        }
        
        if config["stream"] != nil  {
            ldConfig.streamingMode = (config["stream"] as! Bool) ? LDStreamingMode.streaming : LDStreamingMode.polling
        }
        
        if config["disableBackgroundUpdating"] != nil  {
            ldConfig.enableBackgroundUpdates = !(config["disableBackgroundUpdating"] as! Bool)
        }
        
        if config["offline"] != nil  {
            ldConfig.startOnline = !(config["offline"] as! Bool)
        }
        
        if config["debugMode"] != nil {
            ldConfig.isDebugMode = config["debugMode"] as! Bool
        }

        if config["evaluationReasons"] != nil {
            ldConfig.evaluationReasons = config["evaluationReasons"] as! Bool
        }

        ldConfig.wrapperName = config["wrapperName"] as? String
        ldConfig.wrapperVersion = config["wrapperVersion"] as? String

        if config["maxCachedUsers"] != nil {
            ldConfig.maxCachedUsers = config["maxCachedUsers"] as! Int
        }

        if config["diagnosticOptOut"] != nil {
            ldConfig.diagnosticOptOut = config["diagnosticOptOut"] as! Bool
        }

        if config["diagnosticRecordingIntervalMillis"] != nil {
            ldConfig.diagnosticRecordingInterval = TimeInterval(config["diagnosticRecordingIntervalMillis"] as! Float / 1000)
        }

        if config["secondaryMobileKeys"] != nil {
            try! ldConfig.setSecondaryMobileKeys(config["secondaryMobileKeys"] as! [String: String])
        }

        if config["allUserAttributesPrivate"] != nil {
            ldConfig.allUserAttributesPrivate = config["allUserAttributesPrivate"] as! Bool
        }
        
        ldConfig.autoAliasingOptOut = true
        
        return ldConfig
    }
    
    private func userBuild(userDict: NSDictionary) -> LDUser? {
        var user = LDUser()
        user.key = userDict["key"] as! String

        if userDict["secondary"] != nil {
            user.secondary = userDict["secondary"] as? String
        }
        
        if userDict["name"] != nil {
            user.name = userDict["name"] as? String
        }
        
        if userDict["firstName"] != nil {
            user.firstName = userDict["firstName"] as? String
        }
        
        if userDict["lastName"] != nil {
            user.lastName = userDict["lastName"] as? String
        }
        
        if userDict["email"] != nil {
            user.email = userDict["email"] as? String
        }
        
        if userDict["anonymous"] != nil {
            user.isAnonymous = userDict["anonymous"] as! Bool
        }
        
        if userDict["country"] != nil {
            user.country = userDict["country"] as? String
        }

        if userDict["ip"] != nil {
            user.ipAddress = userDict["ip"] as? String
        }

        if userDict["avatar"] != nil {
            user.avatar = userDict["avatar"] as? String
        }
        
        if userDict["privateAttributeNames"] != nil  {
            user.privateAttributes = userDict["privateAttributeNames"] as? [String]
        }
        
        if let customAttributes = userDict["custom"] as! [String: Any]? {
            user.custom = customAttributes
        }
        
        return user
    }
    
    @objc func boolVariationDefaultValue(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue.boolValue) as Bool)
    }
    
    @objc func intVariationDefaultValue(_ flagKey: String, defaultValue: Int, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as Int)
    }
    
    @objc func floatVariationDefaultValue(_ flagKey: String, defaultValue: CGFloat, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: Double(defaultValue)) as Double)
    }
    
    @objc func stringVariationDefaultValue(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get(environment: environment)!.variation(forKey: flagKey, defaultValue: defaultValue) as String)
    }
    
     @objc func boolVariation(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let boolFlagValue: Bool? = LDClient.get(environment: environment)!.variation(forKey: flagKey)
        resolve(boolFlagValue)
    }
    
    @objc func intVariation(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let intFlagValue: Int? = LDClient.get(environment: environment)!.variation(forKey: flagKey)
        resolve(intFlagValue)
    }
    
    @objc func floatVariation(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let floatFlagValue: Double? = LDClient.get(environment: environment)!.variation(forKey: flagKey)
        resolve(floatFlagValue)
    }
    
    @objc func stringVariation(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let stringFlagValue: String? = LDClient.get(environment: environment)!.variation(forKey: flagKey)
        resolve(stringFlagValue)
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
    
    @objc func boolVariationDetailDefaultValue(_ flagKey: String, defaultValue: ObjCBool, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue.boolValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func intVariationDetailDefaultValue(_ flagKey: String, defaultValue: Int, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func floatVariationDetailDefaultValue(_ flagKey: String, defaultValue: CGFloat, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: Double(defaultValue))
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func stringVariationDetailDefaultValue(_ flagKey: String, defaultValue: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey, defaultValue: defaultValue)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func boolVariationDetail(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail: LDEvaluationDetail<Bool?> = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func intVariationDetail(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail: LDEvaluationDetail<Int?> = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func floatVariationDetail(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail: LDEvaluationDetail<Double?> = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey)
        let jsonObject: NSDictionary = [
            "value": (detail.value as Any),
            "variationIndex": (detail.variationIndex as Any),
            "reason": (detail.reason as Any) 
        ]
        resolve(jsonObject)
    }
    
    @objc func stringVariationDetail(_ flagKey: String, environment: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let detail: LDEvaluationDetail<String?> = LDClient.get(environment: environment)!.variationDetail(forKey: flagKey)
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
        LDClient.get()!.setOnline(false) {
            return resolve(true)
        }
    }
    
    @objc func isOffline(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(LDClient.get()!.isOnline)
    }
    
    @objc func setOnline(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()!.setOnline(true) {
            return resolve(true)
        }
    }
    
    @objc func flush() -> Void {
        LDClient.get()!.flush()
    }
    
    @objc func close(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        LDClient.get()!.close()
        resolve(true)
    }
    
    @objc func identify(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let user = userBuild(userDict: options)
        if let usr = user {
            LDClient.get()!.identify(user: usr) {
                resolve(nil)
            }
        } else {
            reject(ERROR_IDENTIFY, "User could not be built using supplied configuration", nil)
        }
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
        let flagChangeOwner = flagKey as LDObserverOwner
        if listenerKeys[flagKey] == nil {
            listenerKeys[flagKey] = flagChangeOwner
        } else {
            return
        }
        LDClient.get(environment: environment)!.observe(keys: [flagKey], owner: flagChangeOwner, handler: { (changedFlags) in
            if changedFlags[flagKey] != nil && self.bridge != nil {
                self.sendEvent(withName: self.FLAG_PREFIX, body: ["flagKey": self.envConcat(environment: environment, identifier: flagKey)])
            }
        })
    }
    
    private func unregisterListener(_ key: String, _ environment: String) -> Void {
        let owner = key as LDObserverOwner
        if listenerKeys[key] != nil {
            listenerKeys.removeValue(forKey: key)
        } else {
            return
        }
        LDClient.get(environment: environment)!.stopObserving(owner: owner)
    }
    
    @objc func unregisterFeatureFlagListener(_ flagKey: String, environment: String) -> Void {
        unregisterListener(flagKey, environment)
    }
    
    @objc func registerCurrentConnectionModeListener(_ listenerId: String, environment: String) -> Void {
        let currentConnectionModeOwner = listenerId as LDObserverOwner
        if listenerKeys[listenerId] == nil {
            listenerKeys.removeValue(forKey: listenerId)
        } else {
            return
        }
        LDClient.get(environment: environment)!.observeCurrentConnectionMode(owner: currentConnectionModeOwner, handler: { (connectionMode) in
            if self.bridge != nil {
                self.sendEvent(withName: self.CONNECTION_MODE_PREFIX, body: ["connectionMode": connectionMode, "listenerId": self.envConcat(environment: environment, identifier: listenerId)])
            }
        })
    }
    
    @objc func unregisterCurrentConnectionModeListener(_ listenerId: String, environment: String) -> Void {
        unregisterListener(listenerId, environment)
    }
    
    @objc func registerAllFlagsListener(_ listenerId: String, environment: String) -> Void {
        let flagChangeOwner = listenerId as LDObserverOwner
        if listenerKeys[listenerId] == nil {
            listenerKeys[listenerId] = flagChangeOwner
        } else {
            return
        }
        LDClient.get(environment: environment)!.observeAll(owner: flagChangeOwner, handler: { (changedFlags) in
            if self.bridge != nil {
                self.sendEvent(withName: self.ALL_FLAGS_PREFIX, body: ["flagKeys": changedFlags.keys.description, "listenerId": self.envConcat(environment: environment, identifier: listenerId)])
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

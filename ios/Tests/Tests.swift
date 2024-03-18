//
//  Tests.swift
//  Tests
//
//  Created by Yusinto Ngadiman on 2/15/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import XCTest
@testable import LaunchDarkly
@testable import LaunchdarklyReactNativeClient

final class Tests: XCTestCase {
    let anonymousNoKey = #"""
{
  "kind": "employee",
  "anonymous": true,
  "name": "Yus"
}
"""#
    
    let employeeJson = #"""
{
  "kind": "employee",
  "key": "blr123",
  "anonymous": true,
  "name": "Yus",
  "employeeNumber": 55,
  "isActive": true,
  "address": {
    "street": "Sunset Blvd",
    "number": 321
  },
  "_meta": {
    "privateAttributes": ["address", "employeeNumber"]
  }
}
"""#
    
    let multiJson = #"""
{
  "kind": "multi",
  "employee": {
    "key": "blr123",
    "anonymous": true,
    "name": "Yus",
    "employeeNumber": 55,
    "isActive": true,
    "address": {
      "street": "Sunset Blvd",
      "number": 321
    },
    "_meta": {
      "privateAttributes": ["address", "employeeNumber"]
    }
  },
  "org": {
    "key": "qf32",
    "name": "Qantas",
    "employeeCount": 10000,
    "isInternational": true,
    "address": {
      "street": "Bourke St",
      "number": 22,
      "country": "Australia"
    }
  }
}
"""#
    
    let config = #"""
{
  "mobileKey": "mob-abc",
  "enableAutoEnvAttributes": true,
  "debugMode": true,
  "application": {
    "id": "rn-unit-test",
    "version": "x.y.z"
  },
  "pollUrl": "https://poll-url",
  "eventsUrl": "https://events-url",
  "streamUrl": "https://stream-url",
  "eventCapacity": 11,
  "flushInterval": 22,
  "connectionTimeout": 33,
  "pollingInterval": 44,
  "backgroundPollingInterval": 55,
  "maxCachedContexts": 66,
  "diagnosticRecordingInterval": 1200000,
  "allAttributesPrivate": true,
  "privateAttributes": ["address", "email", "username"]
}
"""#
    private func jsonToDict(_ json: String) -> NSDictionary {
        let data = try json.data(using: .utf8)
        return try! (JSONSerialization.jsonObject(with: data!, options: []) as? [String : Any])! as NSDictionary
    }
    
    private func createEmployeeContext() -> NSDictionary {
       return jsonToDict(employeeJson)
    }
    
    private func createMultiContext() -> NSDictionary {
        return jsonToDict(multiJson)
    }
    
    func testCreateSingleContext() throws {
        let dict = createEmployeeContext()
        let context = try LaunchdarklyReactNativeClient().createSingleContext(dict as NSDictionary, dict["kind"] as! String)
        let anonymous = context.getValue(Reference("anonymous"))!
        let name = context.getValue(Reference("name"))!
        
        XCTAssertEqual(context.kind, Kind.custom("employee"))
        XCTAssertEqual(context.contextKeys(), ["employee": "blr123"])
        XCTAssertEqual(true, anonymous)
        XCTAssertEqual(name, "Yus")
        XCTAssertEqual(context.attributes, ["employeeNumber": LDValue.number(55.0), "address": LDValue.object(["number": LDValue.number(321.0), "street": LDValue.string("Sunset Blvd")]), "isActive": LDValue.bool(true)])
        XCTAssertEqual(context.privateAttributes, [Reference("address"), Reference("employeeNumber")])
        XCTAssertFalse(context.isMulti())
        
        let expected = try JSONDecoder().decode(LDContext.self, from: Data(employeeJson.utf8))
        XCTAssertEqual(context, expected)
    }
    
    func testAnonymousNoKey() throws {
        let dict = jsonToDict(anonymousNoKey)
        let context = try LaunchdarklyReactNativeClient().createSingleContext(dict as NSDictionary, dict["kind"] as! String)
        let anonymous = context.getValue(Reference("anonymous"))!
        let uuid = context.getValue(Reference("key"))!
        XCTAssertEqual(true, anonymous)
        XCTAssertNotEqual(LDValue.null, uuid)
    }
    
    func testCreateMultiContext() throws {
        let dict = createMultiContext()
        let context = try LaunchdarklyReactNativeClient().contextBuild(dict as NSDictionary)
        
        XCTAssertTrue(context.isMulti())
        XCTAssertEqual(context.contextKeys(), ["employee": "blr123", "org": "qf32"])
        
        let expected = try JSONDecoder().decode(LDContext.self, from: Data(multiJson.utf8))
        XCTAssertEqual(context, expected)
    }
    
    func testConfigBuild() throws {
        let configDict = jsonToDict(config)
        let config = try LaunchdarklyReactNativeClient().configBuild(config: configDict)!
        
        XCTAssertEqual(config.applicationInfo?.buildTag(), "application-id/rn-unit-test application-version/x.y.z")
        XCTAssertEqual(config.baseUrl.absoluteString, configDict["pollUrl"] as! String)
        XCTAssertEqual(config.eventsUrl.absoluteString, configDict["eventsUrl"] as! String)
        XCTAssertEqual(config.streamUrl.absoluteString, configDict["streamUrl"] as! String)
        XCTAssertEqual(config.eventCapacity, configDict["eventCapacity"] as! Int)
        XCTAssertEqual(config.eventFlushInterval as Double * 1000, configDict["flushInterval"] as! Double)
        XCTAssertEqual(config.connectionTimeout as Double * 1000, configDict["connectionTimeout"] as! Double)
        XCTAssertEqual(config.flagPollingInterval as Double * 1000, configDict["pollingInterval"] as! Double)
        XCTAssertEqual(config.backgroundFlagPollingInterval as Double * 1000, configDict["backgroundPollingInterval"] as! Double)
        XCTAssertEqual(config.maxCachedContexts, configDict["maxCachedContexts"] as! Int)
        XCTAssertEqual(config.diagnosticRecordingInterval as Double * 1000, configDict["diagnosticRecordingInterval"] as! Double)
        XCTAssertTrue(config.allContextAttributesPrivate)
        XCTAssertEqual(config.privateContextAttributes, [Reference("address"), Reference("email"), Reference("username")])
        XCTAssertEqual(config.autoEnvAttributes, configDict["enableAutoEnvAttributes"] as! Bool)
    }
}

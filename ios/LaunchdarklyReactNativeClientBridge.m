#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(LaunchdarklyReactNativeClient, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary *)config user:(NSDictionary *)user resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(configureWithTimeout:(NSDictionary *)config user:(NSDictionary *)user timeout:(NSInteger *)timeout resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariation:(NSString *)flagKey defaultValue:(BOOL *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(numberVariation:(NSString *)flagKey defaultValue:(NSNumber *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariation:(NSString *)flagKey defaultValue:(NSString *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariation:(NSString *)flagKey defaultValue:(id *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDetail:(NSString *)flagKey defaultValue:(BOOL *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(numberVariationDetail:(NSString *)flagKey defaultValue:(NSNumber *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDetail:(NSString *)flagKey defaultValue:(NSString *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetail:(NSString *)flagKey defaultValue:(id *)defaultValue environment:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackData:(NSString *)eventName data:(id *)data environment:(NSString *)environment)

RCT_EXTERN_METHOD(trackMetricValue:(NSString *)eventName data:(id *)data metricValue:(NSNumber * _Nonnull)metricValue environment:(NSString *)environment)

RCT_EXTERN_METHOD(setOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setOnline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(flush)

RCT_EXTERN_METHOD(close:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(identify:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(alias:(NSString *)environment user:(NSDictionary *)user previousUser:(NSDictionary *)previousUser)

RCT_EXTERN_METHOD(allFlags:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerFeatureFlagListener:(NSString *)flagKey environment:(NSString *)environment)

RCT_EXTERN_METHOD(unregisterFeatureFlagListener:(NSString *)flagKey environment:(NSString *)environment)

RCT_EXTERN_METHOD(registerCurrentConnectionModeListener:(NSString *)listenerId environment:(NSString *)environment)

RCT_EXTERN_METHOD(unregisterCurrentConnectionModeListener:(NSString *)listenerId environment:(NSString *)environment)

RCT_EXTERN_METHOD(registerAllFlagsListener:(NSString *)listenerId environment:(NSString *)environment)

RCT_EXTERN_METHOD(unregisterAllFlagsListener:(NSString *)listenerId environment:(NSString *)environment)

RCT_EXTERN_METHOD(isInitialized:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConnectionMode:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastSuccessfulConnection:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastFailedConnection:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastFailure:(NSString *)environment resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end

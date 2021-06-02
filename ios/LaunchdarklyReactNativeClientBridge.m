#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(LaunchdarklyReactNativeClient, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary *)config user:(NSDictionary *)user resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(configureWithTimeout:(NSDictionary *)config user:(NSDictionary *)user timeout:(NSInteger *)timeout resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDefaultValue:(NSString *)flagKey defaultValue:(BOOL *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationDefaultValue:(NSString *)flagKey defaultValue:(NSInteger *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationDefaultValue:(NSString *)flagKey defaultValue:(CGFloat *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDefaultValue:(NSString *)flagKey defaultValue:(NSString *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationNone:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationNumber:(NSString *)flagKey defaultValue:(NSNumber *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationBool:(NSString *)flagKey defaultValue:(BOOL *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationString:(NSString *)flagKey defaultValue:(NSString *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationArray:(NSString *)flagKey defaultValue:(NSArray *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationObject:(NSString *)flagKey defaultValue:(NSDictionary *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDetailDefaultValue:(NSString *)flagKey defaultValue:(BOOL *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationDetailDefaultValue:(NSString *)flagKey defaultValue:(NSInteger *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationDetailDefaultValue:(NSString *)flagKey defaultValue:(CGFloat *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDetailDefaultValue:(NSString *)flagKey defaultValue:(NSString *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailNone:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailNumber:(NSString *)flagKey defaultValue:(NSNumber *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailBool:(NSString *)flagKey defaultValue:(BOOL *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailString:(NSString *)flagKey defaultValue:(NSString *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailArray:(NSString *)flagKey defaultValue:(NSArray *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailObject:(NSString *)flagKey defaultValue:(NSDictionary *)defaultValue resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackBool:(NSString *)eventName data:(BOOL *)data)

RCT_EXTERN_METHOD(trackArray:(NSString *)eventName data:(NSArray *)data)

RCT_EXTERN_METHOD(trackNumber:(NSString *)eventName data:(NSNumber * _Nonnull)data)

RCT_EXTERN_METHOD(trackString:(NSString *)eventName data:(NSString *)data)

RCT_EXTERN_METHOD(trackObject:(NSString *)eventName data:(NSDictionary *)data)

RCT_EXTERN_METHOD(track:(NSString *)eventName)

RCT_EXTERN_METHOD(trackBoolMetricValue:(NSString *)eventName data:(BOOL *)data metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(trackArrayMetricValue:(NSString *)eventName data:(NSArray *)data metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(trackNumberMetricValue:(NSString *)eventName data:(NSNumber * _Nonnull)data metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(trackStringMetricValue:(NSString *)eventName data:(NSString *)data metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(trackObjectMetricValue:(NSString *)eventName data:(NSDictionary *)data metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(trackMetricValue:(NSString *)eventName metricValue:(NSNumber * _Nonnull)metricValue)

RCT_EXTERN_METHOD(setOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setOnline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(flush)

RCT_EXTERN_METHOD(close:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(identify:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(allFlags:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerFeatureFlagListener:(NSString *)flagKey)

RCT_EXTERN_METHOD(unregisterFeatureFlagListener:(NSString *)flagKey)

RCT_EXTERN_METHOD(registerCurrentConnectionModeListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(unregisterCurrentConnectionModeListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(registerAllFlagsListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(unregisterAllFlagsListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(isInitialized:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConnectionMode:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastSuccessfulConnection:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastFailedConnection:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastFailure:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end

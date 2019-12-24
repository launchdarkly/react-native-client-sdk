#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(LaunchdarklyReactNativeClient, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary *)config userConfig:(NSDictionary *)userConfig resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationFallback:(NSString *)flagKey fallback:(BOOL *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationFallback:(NSString *)flagKey fallback:(NSInteger *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationFallback:(NSString *)flagKey fallback:(CGFloat *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationFallback:(NSString *)flagKey fallback:(NSString *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariation:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationNone:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationNumber:(NSString *)flagKey fallback:(NSNumber *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationBool:(NSString *)flagKey fallback:(BOOL *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationString:(NSString *)flagKey fallback:(NSString *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationArray:(NSString *)flagKey fallback:(NSArray *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationObject:(NSString *)flagKey fallback:(NSDictionary *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDetailFallback:(NSString *)flagKey fallback:(BOOL *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationDetailFallback:(NSString *)flagKey fallback:(NSInteger *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationDetailFallback:(NSString *)flagKey fallback:(CGFloat *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDetailFallback:(NSString *)flagKey fallback:(NSString *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(boolVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(intVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(floatVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stringVariationDetail:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailNone:(NSString *)flagKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailNumber:(NSString *)flagKey fallback:(NSNumber *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailBool:(NSString *)flagKey fallback:(BOOL *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailString:(NSString *)flagKey fallback:(NSString *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailArray:(NSString *)flagKey fallback:(NSArray *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(jsonVariationDetailObject:(NSString *)flagKey fallback:(NSDictionary *)fallback resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackBool:(NSString *)eventName data:(BOOL *)data)

RCT_EXTERN_METHOD(trackArray:(NSString *)eventName data:(NSArray *)data)

RCT_EXTERN_METHOD(trackNumber:(NSString *)eventName data:(NSNumber *)data)

RCT_EXTERN_METHOD(trackString:(NSString *)eventName data:(NSString *)data)

RCT_EXTERN_METHOD(trackObject:(NSString *)eventName data:(NSDictionary *)data)

RCT_EXTERN_METHOD(track:(NSString *)eventName)

RCT_EXTERN_METHOD(trackBoolMetricValue:(NSString *)eventName data:(BOOL *)data metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(trackArrayMetricValue:(NSString *)eventName data:(NSArray *)data metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(trackNumberMetricValue:(NSString *)eventName data:(NSNumber *)data metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(trackStringMetricValue:(NSString *)eventName data:(NSString *)data metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(trackObjectMetricValue:(NSString *)eventName data:(NSDictionary *)data metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(trackMetricValue:(NSString *)eventName metricValue:(NSNumber *)metricValue)

RCT_EXTERN_METHOD(setOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isOffline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setOnline:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(flush)

RCT_EXTERN_METHOD(close:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(identify:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(allFlags:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerFeatureFlagListener:(NSString *)flagKey)

RCT_EXTERN_METHOD(unregisterFeatureFlagListener:(NSString *)flagKey)

RCT_EXTERN_METHOD(isDisableBackgroundPolling:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getConnectionInformation:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerCurrentConnectionModeListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(unregisterCurrentConnectionModeListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(registerAllFlagsListener:(NSString *)listenerId)

RCT_EXTERN_METHOD(unregisterAllFlagsListener:(NSString *)listenerId)

@end

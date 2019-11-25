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

RCT_EXTERN_METHOD(trackBool:(NSString *)eventName data:(BOOL *)data)

RCT_EXTERN_METHOD(trackArray:(NSString *)eventName data:(NSArray *)data)

RCT_EXTERN_METHOD(trackNumber:(NSString *)eventName data:(NSNumber *)data)

RCT_EXTERN_METHOD(trackString:(NSString *)eventName data:(NSString *)data)

RCT_EXTERN_METHOD(trackObject:(NSString *)eventName data:(NSDictionary *)data)

RCT_EXTERN_METHOD(track:(NSString *)eventName)

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

@end

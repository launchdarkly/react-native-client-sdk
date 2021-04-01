
// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our index.d.ts file. The code will not actually be run.

import LDClient, {
    LDConnectionMode,
    LDConfig,
    LDEvaluationDetail, 
    LDEvaluationReason, 
    LDFailureReason, 
    LDFlagSet,
    LDUser, 
} from 'launchdarkly-react-native-client-sdk';

async function tests() {
    const jsonObj: Record<string, any> = {
        'a': 's',
        'b': true,
        'c': 3,
        'd': [ 'x', 'y' ],
        'e': [ true, false ],
        'f': [ 1, 2 ]
    };

    const configWithKeyOnly: LDConfig = {
        mobileKey: ''
    };
    const configWithAllOptions: LDConfig = {
        mobileKey: '',
        pollUri: '',
        streamUri: '',
        eventsUri: '',
        eventsCapacity: 1,
        eventsFlushIntervalMillis: 1,
        connectionTimeoutMillis: 1,
        pollingIntervalMillis: 1,
        backgroundPollingIntervalMillis: 1,
        useReport: true,
        stream: true,
        disableBackgroundUpdating: true,
        offline: true,
        debugMode: true,
        evaluationReasons: true,
        maxCachedUsers: 6,
        diagnosticOptOut: true,
        diagnosticRecordingIntervalMillis: 100000,
        allUserAttributesPrivate: true,
    };
    const userWithKeyOnly: LDUser = { key: 'user' };
    const user: LDUser = {
        key: 'user',
        name: 'name',
        firstName: 'first',
        lastName: 'last',
        email: 'test@example.com',
        anonymous: true,
        country: 'us',
        privateAttributeNames: [ 'name', 'email' ],
        custom: jsonObj,
        avatar: 'avatar',
        ip: '192.0.2.1',
    };
    const client: LDClient = new LDClient();
    const timeoutClient: LDClient = new LDClient();

    const configure: null = await client.configure(configWithAllOptions, user);
    const configureWithTimeout: null = await timeoutClient.configure(configWithAllOptions, user, 10);
    const identify: null = await client.identify(user);

    const boolFlagValue: boolean = await client.boolVariation('key', false);
    const intFlagValue: number = await client.intVariation('key', 2);
    const floatFlagValue: number = await client.floatVariation('key', 2.3);
    const stringFlagValue: string = await client.stringVariation('key', 'default');
    const jsonFlagValue: Record<string, any> = await client.jsonVariation('key', jsonObj);

    const boolDetail: LDEvaluationDetail<boolean> = await client.boolVariationDetail('key', false);
    const intDetail: LDEvaluationDetail<number> = await client.intVariationDetail('key', 2);
    const floatDetail: LDEvaluationDetail<number> = await client.floatVariationDetail('key', 2.3);
    const stringDetail: LDEvaluationDetail<string> = await client.stringVariationDetail('key', 'default');
    const jsonDetail: LDEvaluationDetail<Record<string, any>> = await client.jsonVariationDetail('key', jsonObj);

    const detailIndex: number | undefined = boolDetail.variationIndex;
    const detailReason: LDEvaluationReason = boolDetail.reason;
    const detailBoolValue: boolean = boolDetail.value;
    const detailIntValue: number = intDetail.value;
    const detailFloatValue: number = floatDetail.value;
    const detailStringValue: string = stringDetail.value;
    const detailJsonValue: Record<string, any> = jsonDetail.value;

    const flagSet: LDFlagSet = await client.allFlags();
    const flagSetValue: any = flagSet['key'];

    const track1: void = await client.track('eventname');
    const track2: void = await client.track('eventname', undefined);
    const track3: void = await client.track('eventname', true);
    const track4: void = await client.track('eventname', 2);
    const track5: void = await client.track('eventname', 2.3);
    const track6: void = await client.track('eventname', 'something');
    const track7: void = await client.track('eventname', [2, 3]);
    const track8: void = await client.track('eventname', { foo: 2});
    const track9: void = await client.track('eventname', { foo: 2}, 4);

    const setOffline: boolean = await client.setOffline();
    const setOnline: boolean = await client.setOnline();
    const isOffline: boolean = await client.isOffline();
    const isInitialized: boolean = await client.isInitialized();

    const callback = function(_: string): void { };
    const registerFeatureFlagListener: void = client.registerFeatureFlagListener('key', callback);
    const unregisterFeatureFlagListener: void = client.unregisterFeatureFlagListener('key', callback);
    const registerAllFlagsListener: void = client.registerAllFlagsListener('id', flags => flags);
    const unregisterAllFlagsListener: void = client.unregisterAllFlagsListener('id');
    const registerCurrentConnectionModeListener: void = client.registerCurrentConnectionModeListener('id', callback);
    const unregisterCurrentConnectionModeListener: void = client.unregisterCurrentConnectionModeListener('id');

    const getConnectionMode: LDConnectionMode = await client.getConnectionMode();
    const getSuccessfulConnection: number | null = await client.getLastSuccessfulConnection();
    const getFailedConnection: number | null = await client.getLastFailedConnection();
    const getFailureReason: LDFailureReason | null = await client.getLastFailure();

    const flush: void = await client.flush();
    const close: void = await client.close();
    
    const version: String = client.getVersion();
};

tests();
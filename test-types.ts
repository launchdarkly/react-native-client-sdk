
// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our index.d.ts file. The code will not actually be run.

import { 
    LDClient, 
    LDClientConfig,
    LDEvaluationDetail, 
    LDEvaluationReason, 
    LDFlagSet,
    LDUserConfig, 
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

    const configWithKeyOnly: LDClientConfig = {
        mobileKey: ''
    };
    const configWithAllOptions: LDClientConfig = {
        mobileKey: '',
        baseUri: '',
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
    };
    const userWithKeyOnly: LDUserConfig = { key: 'user' };
    const user: LDUserConfig = {
        key: 'user',
        name: 'name',
        firstName: 'first',
        lastName: 'last',
        email: 'test@example.com',
        anonymous: true,
        country: 'us',
        privateAttributeNames: [ 'name', 'email' ],
        custom: jsonObj,
    };
    const client: LDClient = new LDClient();

    const configure: null = await client.configure(configWithAllOptions, user);
    const identify: null = await client.identify(user);

    const boolFlagValue: boolean = await client.boolVariation('key', false);
    const intFlagValue: number = await client.intVariation('key', 2);
    const floatFlagValue: number = await client.floatVariation('key', 2.3);
    const stringFlagValue: string = await client.stringVariation('key', 'default');
    const jsonFlagValue: Record<string, any> = await client.jsonVariation('key', jsonObj);

    const boolDetail: LDEvaluationDetail<boolean> | boolean = await client.boolVariationDetail('key', false);
    const intDetail: LDEvaluationDetail<number> | number = await client.intVariationDetail('key', 2);
    const floatDetail: LDEvaluationDetail<number> | number = await client.floatVariationDetail('key', 2.3);
    const stringDetail: LDEvaluationDetail<string> | string = await client.stringVariationDetail('key', 'default');
    const jsonDetail: LDEvaluationDetail<Record<string, any>> | Record<string, any> = await client.jsonVariationDetail('key', jsonObj);

    const detailCasted = boolDetail as LDEvaluationDetail<boolean>;
    const detailValue: boolean = detailCasted.value;
    const detailIndex: number | undefined = detailCasted.variationIndex;
    const detailReason: LDEvaluationReason = detailCasted.reason;

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
    const isDisableBackgroundPolling: boolean = await client.isDisableBackgroundPolling();

    const callback = function(_: string): void { };
    const registerFeatureFlagListener: void = client.registerFeatureFlagListener('key', callback);
    const unregisterFeatureFlagListener: void = client.unregisterFeatureFlagListener('key', callback);
    const registerAllFlagsListener: void = client.registerAllFlagsListener('id', flags => flags);
    const unregisterAllFlagsListener: void = client.unregisterAllFlagsListener('id');
    const registerCurrentConnectionModeListener: void = client.registerCurrentConnectionModeListener('id', callback);
    const unregisterCurrentConnectionModeListener: void = client.unregisterCurrentConnectionModeListener('id');

    const getConnectionInformation: any = await client.getConnectionInformation();

    const flush: void = await client.flush();
    const close: void = await client.close();
};

tests();
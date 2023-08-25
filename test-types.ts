// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our index.d.ts file. The code will not actually be run.

import LDClient, {
  LDConnectionMode,
  LDConfig,
  LDEvaluationDetail,
  LDEvaluationReason,
  LDFailureReason,
  LDFlagSet,
  LDContext,
} from 'launchdarkly-react-native-client-sdk';

async function tests() {
  const jsonObj: Record<string, any> = {
    a: 's',
    b: true,
    c: 3,
    d: ['x', 'y'],
    e: [true, false],
    f: [1, 2],
  };

  const jsonArr: any[] = ['a', 1, null, false, { a: 3 }, []];

  const configWithKeyOnly: LDConfig = {
    mobileKey: '',
    enableAutoEnvAttributes: true,
  };
  const configWithAllOptions: LDConfig = {
    application: {
      id: 'rn-unit-test',
      version: '0.0.1',
      name: 'RN app with LD',
      versionName: 'Beta release 0.0.1',
    },
    mobileKey: '',
    enableAutoEnvAttributes: true,
    pollUrl: '',
    streamUrl: '',
    eventsUrl: '',
    eventCapacity: 1,
    flushInterval: 1,
    connectionTimeout: 1,
    pollingInterval: 1,
    backgroundPollingInterval: 1,
    useReport: true,
    stream: true,
    disableBackgroundUpdating: true,
    offline: true,
    debugMode: true,
    evaluationReasons: true,
    secondaryMobileKeys: { test: 'fake_key' },
    maxCachedContexts: 6,
    diagnosticOptOut: true,
    diagnosticRecordingInterval: 100000,
    allAttributesPrivate: true,
    privateAttributes: ['abc', 'def'],
  };
  const userEmpty: LDContext = {};
  const userWithKeyOnly: LDContext = { kind: 'user', key: 'test-user-1' };
  const user: LDContext = {
    kind: 'user',
    key: 'test-user-2',
    name: 'name',
    firstName: 'first',
    lastName: 'last',
    email: 'test@example.com',
    anonymous: true,
    country: 'us',
    privateAttributeNames: ['name', 'email'],
    custom: jsonObj,
    avatar: 'avatar',
    ip: '192.0.2.1',
  };
  const client: LDClient = new LDClient();
  const timeoutClient: LDClient = new LDClient();

  const configure: null = await client.configure(configWithAllOptions, user);
  const configureWithTimeout: null = await timeoutClient.configure(configWithAllOptions, userWithKeyOnly, 10);
  const identify: null = await client.identify(user);

  const boolFlagValue: boolean = await client.boolVariation('key', false);
  const floatFlagValue: number = await client.numberVariation('key', 2.3);
  const stringFlagValue: string = await client.stringVariation('key', 'default');
  const jsonObjFlagValue: any = await client.jsonVariation('key', jsonObj);
  const jsonArrFlagValue: any = await client.jsonVariation('key', jsonArr);
  const jsonSimpleFlagValue: any = await client.jsonVariation('key', 3);

  const boolDetail: LDEvaluationDetail<boolean> = await client.boolVariationDetail('key', false);
  const floatDetail: LDEvaluationDetail<number> = await client.numberVariationDetail('key', 2.3);
  const stringDetail: LDEvaluationDetail<string> = await client.stringVariationDetail('key', 'default');
  const jsonDetail: LDEvaluationDetail<any> = await client.jsonVariationDetail('key', jsonObj);

  const boolDetailMulti: LDEvaluationDetail<boolean> = await client.boolVariationDetail('key', false, 'test');
  const floatDetailMulti: LDEvaluationDetail<number> = await client.numberVariationDetail('key', 2.3, 'test');
  const stringDetailMulti: LDEvaluationDetail<string> = await client.stringVariationDetail('key', 'default', 'test');
  const jsonDetailMulti: LDEvaluationDetail<any> = await client.jsonVariationDetail('key', jsonObj, 'test');

  const detailIndex: number | undefined = boolDetail.variationIndex;
  const detailReason: LDEvaluationReason = boolDetail.reason;
  const detailBoolValue: boolean = boolDetail.value;
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
  const track8: void = await client.track('eventname', { foo: 2 });
  const track9: void = await client.track('eventname', { foo: 2 }, 4);

  const setOffline: boolean = await client.setOffline();
  const setOnline: boolean = await client.setOnline();
  const isOffline: boolean = await client.isOffline();
  const isInitialized: boolean = await client.isInitialized();

  const callback = function (_: string): void {};
  const registerFeatureFlagListener: void = client.registerFeatureFlagListener('key', callback);
  const unregisterFeatureFlagListener: void = client.unregisterFeatureFlagListener('key', callback);
  const registerAllFlagsListener: void = client.registerAllFlagsListener('id', (flags) => flags);
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
}

tests();

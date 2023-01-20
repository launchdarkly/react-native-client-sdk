import { NativeModules, NativeEventEmitter } from 'react-native';
import LDClient from './index.js';

const defValErr = new Error('Missing or invalid defaultValue for variation call');

var client;
var addListenerMock;
let nativeMock = NativeModules.LaunchdarklyReactNativeClient;

function getClientFlagListener() {
  return addListenerMock.calls[0][1];
}

function getClientFlagsListener() {
  return addListenerMock.calls[1][1];
}

function getClientConnectionListener() {
  return addListenerMock.calls[2][1];
}

beforeEach(() => {
  Object.values(nativeMock).forEach((v) => {
    if (typeof v === 'function') {
      v.mockClear();
    }
  });
  NativeEventEmitter.mockClear();

  client = new LDClient();
  expect(NativeEventEmitter).toHaveBeenCalledTimes(1);
  expect(NativeEventEmitter.mock.calls[0].length).toBe(1);
  expect(Object.is(NativeEventEmitter.mock.calls[0][0], NativeModules.LaunchdarklyReactNativeClient)).toBe(true);

  addListenerMock = NativeEventEmitter.mock.results[0].value.addListener.mock;
});

test('constructor', () => {
  expect(addListenerMock.calls.length).toBe(3);
  expect(addListenerMock.calls[0].length).toBe(2);
  expect(addListenerMock.calls[1].length).toBe(2);
  expect(addListenerMock.calls[2].length).toBe(2);
  expect(addListenerMock.calls[0][0]).toBe(nativeMock.FLAG_PREFIX);
  expect(addListenerMock.calls[1][0]).toBe(nativeMock.ALL_FLAGS_PREFIX);
  expect(addListenerMock.calls[2][0]).toBe(nativeMock.CONNECTION_MODE_PREFIX);
});

describe('boolVariation', () => {
  test('validates defaultValue', async () => {
    expect.assertions(11);

    await expect(client.boolVariation('flagKey')).rejects.toEqual(defValErr);
    await expect(client.boolVariation('flagKey', null)).rejects.toEqual(defValErr);
    await expect(client.boolVariation('flagKey', 5)).rejects.toEqual(defValErr);
    await expect(client.boolVariationDetail('flagKey')).rejects.toEqual(defValErr);
    await expect(client.boolVariationDetail('flagKey', null)).rejects.toEqual(defValErr);
    await expect(client.boolVariationDetail('flagKey', 5)).rejects.toEqual(defValErr);

    expect(nativeMock.boolVariation).toHaveBeenCalledTimes(0);
    expect(nativeMock.boolVariationDetail).toHaveBeenCalledTimes(0);
  });

  test('calls native', async () => {
    nativeMock.boolVariation.mockImplementation((k, def, env) => Promise.resolve(!def));

    await expect(client.boolVariation('key1', true)).resolves.toEqual(false);
    await expect(client.boolVariation('key2', false, 'alt')).resolves.toEqual(true);
    await expect(client.boolVariation('key3', false, 5)).resolves.toEqual(true);

    expect(nativeMock.boolVariation).toHaveBeenCalledTimes(3);
    expect(nativeMock.boolVariation).toHaveBeenNthCalledWith(1, 'key1', true, 'default');
    expect(nativeMock.boolVariation).toHaveBeenNthCalledWith(2, 'key2', false, 'alt');
    expect(nativeMock.boolVariation).toHaveBeenNthCalledWith(3, 'key3', false, 'default');
  });

  test('detailed calls native', async () => {
    nativeMock.boolVariationDetail.mockImplementation((k, def, env) => Promise.resolve(!def));

    await expect(client.boolVariationDetail('key1', true)).resolves.toEqual(false);
    await expect(client.boolVariationDetail('key2', false, 'alt')).resolves.toEqual(true);
    await expect(client.boolVariationDetail('key3', false, 5)).resolves.toEqual(true);

    expect(nativeMock.boolVariationDetail).toHaveBeenCalledTimes(3);
    expect(nativeMock.boolVariationDetail).toHaveBeenNthCalledWith(1, 'key1', true, 'default');
    expect(nativeMock.boolVariationDetail).toHaveBeenNthCalledWith(2, 'key2', false, 'alt');
    expect(nativeMock.boolVariationDetail).toHaveBeenNthCalledWith(3, 'key3', false, 'default');
  });
});

describe('numberVariation', () => {
  test('validates defaultValue', async () => {
    expect.assertions(13);

    await expect(client.numberVariation('flagKey')).rejects.toEqual(defValErr);
    await expect(client.numberVariation('flagKey', null)).rejects.toEqual(defValErr);
    await expect(client.numberVariation('flagKey', false)).rejects.toEqual(defValErr);
    await expect(client.numberVariation('flagKey', NaN)).rejects.toEqual(defValErr);
    await expect(client.numberVariationDetail('flagKey')).rejects.toEqual(defValErr);
    await expect(client.numberVariationDetail('flagKey', null)).rejects.toEqual(defValErr);
    await expect(client.numberVariationDetail('flagKey', false)).rejects.toEqual(defValErr);
    await expect(client.numberVariationDetail('flagKey', NaN)).rejects.toEqual(defValErr);

    expect(nativeMock.numberVariation).toHaveBeenCalledTimes(0);
    expect(nativeMock.numberVariationDetail).toHaveBeenCalledTimes(0);
  });

  test('calls native', async () => {
    nativeMock.numberVariation.mockImplementation((k, def, env) => Promise.resolve(def + 1.5));

    await expect(client.numberVariation('key1', 0)).resolves.toEqual(1.5);
    await expect(client.numberVariation('key2', 5, 'alt')).resolves.toEqual(6.5);
    await expect(client.numberVariation('key3', 2.5, 5)).resolves.toEqual(4);

    expect(nativeMock.numberVariation).toHaveBeenCalledTimes(3);
    expect(nativeMock.numberVariation).toHaveBeenNthCalledWith(1, 'key1', 0, 'default');
    expect(nativeMock.numberVariation).toHaveBeenNthCalledWith(2, 'key2', 5, 'alt');
    expect(nativeMock.numberVariation).toHaveBeenNthCalledWith(3, 'key3', 2.5, 'default');
  });

  test('detailed calls native', async () => {
    nativeMock.numberVariationDetail.mockImplementation((k, def, env) => Promise.resolve(def + 1.5));

    await expect(client.numberVariationDetail('key1', 0)).resolves.toEqual(1.5);
    await expect(client.numberVariationDetail('key2', 5, 'alt')).resolves.toEqual(6.5);
    await expect(client.numberVariationDetail('key3', 2.5, 5)).resolves.toEqual(4);

    expect(nativeMock.numberVariationDetail).toHaveBeenCalledTimes(3);
    expect(nativeMock.numberVariationDetail).toHaveBeenNthCalledWith(1, 'key1', 0, 'default');
    expect(nativeMock.numberVariationDetail).toHaveBeenNthCalledWith(2, 'key2', 5, 'alt');
    expect(nativeMock.numberVariationDetail).toHaveBeenNthCalledWith(3, 'key3', 2.5, 'default');
  });
});

describe('stringVariation', () => {
  test('validates defaultValue', async () => {
    expect.assertions(7);

    await expect(client.stringVariation('flagKey', false)).rejects.toEqual(defValErr);
    await expect(client.stringVariationDetail('flagKey', false)).rejects.toEqual(defValErr);

    expect(nativeMock.stringVariation).toHaveBeenCalledTimes(0);
    expect(nativeMock.stringVariationDetail).toHaveBeenCalledTimes(0);
  });

  test('calls native', async () => {
    nativeMock.stringVariation.mockImplementation((k, def, env) => Promise.resolve('foo'.concat(def)));

    await expect(client.stringVariation('key1', '1')).resolves.toEqual('foo1');
    await expect(client.stringVariation('key2', null, 'alt')).resolves.toEqual('foonull');
    await expect(client.stringVariation('key3', undefined, 5)).resolves.toEqual('foonull');

    expect(nativeMock.stringVariation).toHaveBeenCalledTimes(3);
    expect(nativeMock.stringVariation).toHaveBeenNthCalledWith(1, 'key1', '1', 'default');
    expect(nativeMock.stringVariation).toHaveBeenNthCalledWith(2, 'key2', null, 'alt');
    expect(nativeMock.stringVariation).toHaveBeenNthCalledWith(3, 'key3', null, 'default');
  });

  test('detailed calls native', async () => {
    nativeMock.stringVariationDetail.mockImplementation((k, def, env) => Promise.resolve('foo'.concat(def)));

    await expect(client.stringVariationDetail('key1', '1')).resolves.toEqual('foo1');
    await expect(client.stringVariationDetail('key2', null, 'alt')).resolves.toEqual('foonull');
    await expect(client.stringVariationDetail('key3', undefined, 5)).resolves.toEqual('foonull');

    expect(nativeMock.stringVariationDetail).toHaveBeenCalledTimes(3);
    expect(nativeMock.stringVariationDetail).toHaveBeenNthCalledWith(1, 'key1', '1', 'default');
    expect(nativeMock.stringVariationDetail).toHaveBeenNthCalledWith(2, 'key2', null, 'alt');
    expect(nativeMock.stringVariationDetail).toHaveBeenNthCalledWith(3, 'key3', null, 'default');
  });
});

test('allFlags', () => {
  nativeMock.allFlags.mockReturnValueOnce('pass1');
  expect(client.allFlags()).toBe('pass1');
  expect(nativeMock.allFlags).toHaveBeenCalledTimes(1);
  expect(nativeMock.allFlags).toHaveBeenNthCalledWith(1, 'default');

  nativeMock.allFlags.mockReturnValueOnce('pass2');
  expect(client.allFlags('alt')).toBe('pass2');
  expect(nativeMock.allFlags).toHaveBeenCalledTimes(2);
  expect(nativeMock.allFlags).toHaveBeenNthCalledWith(2, 'alt');
});

test('setOffline', () => {
  nativeMock.setOffline.mockReturnValue('passthrough');
  expect(client.setOffline()).toBe('passthrough');
  expect(nativeMock.setOffline).toHaveBeenCalledTimes(1);
});

test('isOffline', () => {
  nativeMock.isOffline.mockReturnValue(true);
  expect(client.isOffline()).toBe(true);
  expect(nativeMock.isOffline).toHaveBeenCalledTimes(1);
});

test('setOnline', () => {
  nativeMock.setOnline.mockReturnValue('passthrough');
  expect(client.setOnline()).toBe('passthrough');
  expect(nativeMock.setOnline).toHaveBeenCalledTimes(1);
});

test('isInitialized', () => {
  nativeMock.isInitialized.mockReturnValueOnce(false);
  expect(client.isInitialized()).toBe(false);
  nativeMock.isInitialized.mockReturnValueOnce(true);
  expect(client.isInitialized('alt')).toBe(true);

  expect(nativeMock.isInitialized).toHaveBeenCalledTimes(2);
  expect(nativeMock.isInitialized).toHaveBeenNthCalledWith(1, 'default');
  expect(nativeMock.isInitialized).toHaveBeenNthCalledWith(2, 'alt');
});

test('flush', () => {
  client.flush();
  expect(nativeMock.flush).toHaveBeenCalledTimes(1);
  expect(nativeMock.flush).toHaveBeenNthCalledWith(1);
});

test('close', () => {
  client.close();
  expect(nativeMock.close).toHaveBeenCalledTimes(1);
  expect(nativeMock.close).toHaveBeenNthCalledWith(1);
});

test('identify', () => {
  nativeMock.identify.mockReturnValueOnce('pass1');
  expect(client.identify({ name: 'John Smith' })).toBe('pass1');
  expect(nativeMock.identify).toHaveBeenCalledTimes(1);
  expect(nativeMock.identify).toHaveBeenNthCalledWith(1, {
    name: 'John Smith',
  });
});

test('alias', () => {
  client.alias({ key: 'anon', anonymous: true }, { key: 'abc' });
  expect(nativeMock.alias).toHaveBeenCalledTimes(1);
  expect(nativeMock.alias).toHaveBeenNthCalledWith(1, 'default', { key: 'anon', anonymous: true }, { key: 'abc' });

  client.alias({ key: 'abc' }, { key: 'def' }, 'alt');
  expect(nativeMock.alias).toHaveBeenCalledTimes(2);
  expect(nativeMock.alias).toHaveBeenNthCalledWith(2, 'alt', { key: 'abc' }, { key: 'def' });
});

test('featureFlagListener', () => {
  let clientListener = getClientFlagListener();
  let listener1 = jest.fn();
  let listener2 = jest.fn();
  let listener3 = jest.fn();
  client.registerFeatureFlagListener('a', listener1);
  client.registerFeatureFlagListener('a', listener2, 'alt');

  expect(listener1).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenCalledTimes(0);

  expect(nativeMock.registerFeatureFlagListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.registerFeatureFlagListener).toHaveBeenNthCalledWith(1, 'a', 'default');
  expect(nativeMock.registerFeatureFlagListener).toHaveBeenNthCalledWith(2, 'a', 'alt');

  client.registerFeatureFlagListener('a', listener3, 'default');
  // JS wrapper coalesces listeners for the same key and environment
  expect(nativeMock.registerFeatureFlagListener).toHaveBeenCalledTimes(2);
  expect(listener3).toHaveBeenCalledTimes(0);

  // Wrapper doesn't call listeners for differing key
  clientListener({ flagKey: 'b', listenerId: 'default;b' });
  expect(listener1).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenCalledTimes(0);
  expect(listener3).toHaveBeenCalledTimes(0);

  // Wrapper calls single listener
  clientListener({ flagKey: 'a', listenerId: 'alt;a' });
  expect(listener1).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener3).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenNthCalledWith(1, 'a');

  // Wrapper informs both coalesced listeners
  clientListener({ flagKey: 'a', listenerId: 'default;a' });
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener3).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenNthCalledWith(1, 'a');
  expect(listener3).toHaveBeenNthCalledWith(1, 'a');

  // Remove single listener from coalesced, should not unregister from native
  client.unregisterFeatureFlagListener('a', listener3);
  expect(nativeMock.unregisterFeatureFlagListener).toHaveBeenCalledTimes(0);

  clientListener({ flagKey: 'a', listenerId: 'default;a' });
  expect(listener1).toHaveBeenCalledTimes(2);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener3).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenNthCalledWith(2, 'a');

  // Removing remaining listener should unregister on native
  client.unregisterFeatureFlagListener('a', listener1, 'default');
  client.unregisterFeatureFlagListener('a', listener2, 'alt');
  expect(nativeMock.unregisterFeatureFlagListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.unregisterFeatureFlagListener).toHaveBeenNthCalledWith(1, 'a', 'default');
  expect(nativeMock.unregisterFeatureFlagListener).toHaveBeenNthCalledWith(2, 'a', 'alt');

  // No longer calls listeners
  clientListener({ flagKey: 'a', listenerId: 'default;a' });
  clientListener({ flagKey: 'a', listenerId: 'alt;a' });
  expect(listener1).toHaveBeenCalledTimes(2);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener3).toHaveBeenCalledTimes(1);
});

test('connectionModeListener', () => {
  let clientListener = getClientConnectionListener();
  let listener1 = jest.fn();
  let listener2 = jest.fn();
  client.registerCurrentConnectionModeListener('a', listener1);
  client.registerCurrentConnectionModeListener('b', listener2, 'alt');

  expect(listener1).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenCalledTimes(0);

  expect(nativeMock.registerCurrentConnectionModeListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.registerCurrentConnectionModeListener).toHaveBeenNthCalledWith(1, 'a', 'default');
  expect(nativeMock.registerCurrentConnectionModeListener).toHaveBeenNthCalledWith(2, 'b', 'alt');

  clientListener({ connectionMode: ['abc'], listenerId: 'default;a' });
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenNthCalledWith(1, ['abc']);
  expect(listener2).toHaveBeenCalledTimes(0);

  clientListener({ connectionMode: ['def'], listenerId: 'alt;b' });
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenNthCalledWith(1, ['def']);

  client.unregisterCurrentConnectionModeListener('b', 'alt');

  expect(nativeMock.unregisterCurrentConnectionModeListener).toHaveBeenCalledTimes(1);
  expect(nativeMock.unregisterCurrentConnectionModeListener).toHaveBeenNthCalledWith(1, 'b', 'alt');

  clientListener({ connectionMode: [], listenerId: 'alt;b' });
  clientListener({ connectionMode: [], listenerId: 'alt;a' });

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);

  client.unregisterCurrentConnectionModeListener('a', 'default');
  client.unregisterCurrentConnectionModeListener('b', 'alt');

  expect(nativeMock.unregisterCurrentConnectionModeListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.unregisterCurrentConnectionModeListener).toHaveBeenNthCalledWith(2, 'a', 'default');
});

test('allFlagsListener', () => {
  let clientListener = getClientFlagsListener();
  let listener1 = jest.fn();
  let listener2 = jest.fn();
  client.registerAllFlagsListener('a', listener1);
  client.registerAllFlagsListener('b', listener2, 'alt');

  expect(listener1).toHaveBeenCalledTimes(0);
  expect(listener2).toHaveBeenCalledTimes(0);

  expect(nativeMock.registerAllFlagsListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.registerAllFlagsListener).toHaveBeenNthCalledWith(1, 'a', 'default');
  expect(nativeMock.registerAllFlagsListener).toHaveBeenNthCalledWith(2, 'b', 'alt');

  clientListener({ flagKeys: ['abc'], listenerId: 'default;a' });
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenNthCalledWith(1, ['abc']);
  expect(listener2).toHaveBeenCalledTimes(0);

  clientListener({ flagKeys: ['def'], listenerId: 'alt;b' });
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenNthCalledWith(1, ['def']);

  client.unregisterAllFlagsListener('b', 'alt');

  expect(nativeMock.unregisterAllFlagsListener).toHaveBeenCalledTimes(1);
  expect(nativeMock.unregisterAllFlagsListener).toHaveBeenNthCalledWith(1, 'b', 'alt');

  clientListener({ flagKeys: [], listenerId: 'alt;b' });
  clientListener({ flagKeys: [], listenerId: 'alt;a' });

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);

  client.unregisterAllFlagsListener('a', 'default');
  client.unregisterAllFlagsListener('b', 'alt');

  expect(nativeMock.unregisterAllFlagsListener).toHaveBeenCalledTimes(2);
  expect(nativeMock.unregisterAllFlagsListener).toHaveBeenNthCalledWith(2, 'a', 'default');
});

test('getConnectionMode', () => {
  nativeMock.getConnectionMode.mockReturnValue('passthrough');

  expect(client.getConnectionMode()).toBe('passthrough');
  expect(client.getConnectionMode('alt')).toBe('passthrough');

  expect(nativeMock.getConnectionMode).toHaveBeenCalledTimes(2);
  expect(nativeMock.getConnectionMode).toHaveBeenNthCalledWith(1, 'default');
  expect(nativeMock.getConnectionMode).toHaveBeenNthCalledWith(2, 'alt');
});

test('getLastSuccessfulConnection', () => {
  nativeMock.getLastSuccessfulConnection.mockReturnValue('passthrough');

  expect(client.getLastSuccessfulConnection()).toBe('passthrough');
  expect(client.getLastSuccessfulConnection('alt')).toBe('passthrough');

  expect(nativeMock.getLastSuccessfulConnection).toHaveBeenCalledTimes(2);
  expect(nativeMock.getLastSuccessfulConnection).toHaveBeenNthCalledWith(1, 'default');
  expect(nativeMock.getLastSuccessfulConnection).toHaveBeenNthCalledWith(2, 'alt');
});

test('getLastFailedConnection', () => {
  nativeMock.getLastFailedConnection.mockReturnValue('passthrough');

  expect(client.getLastFailedConnection()).toBe('passthrough');
  expect(client.getLastFailedConnection('alt')).toBe('passthrough');

  expect(nativeMock.getLastFailedConnection).toHaveBeenCalledTimes(2);
  expect(nativeMock.getLastFailedConnection).toHaveBeenNthCalledWith(1, 'default');
  expect(nativeMock.getLastFailedConnection).toHaveBeenNthCalledWith(2, 'alt');
});

test('getLastFailure', () => {
  nativeMock.getLastFailure.mockReturnValue('passthrough');

  expect(client.getLastFailure()).toBe('passthrough');
  expect(client.getLastFailure('alt')).toBe('passthrough');

  expect(nativeMock.getLastFailure).toHaveBeenCalledTimes(2);
  expect(nativeMock.getLastFailure).toHaveBeenNthCalledWith(1, 'default');
  expect(nativeMock.getLastFailure).toHaveBeenNthCalledWith(2, 'alt');
});

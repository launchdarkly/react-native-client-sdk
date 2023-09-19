/* eslint-disable no-bitwise */
import React, { useState, useEffect, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Button, TextInput, Alert, Switch } from 'react-native';
import { MOBILE_KEY } from '@env';
import { Picker } from '@react-native-picker/picker';
import LDClient, { LDConfig, LDMultiKindContext } from 'launchdarkly-react-native-client-sdk';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

const Wrapper = ({ children }: { children: ReactNode }) => {
  const styles = {
    scroll: { backgroundColor: '#fff', padding: 10 },
    area: { backgroundColor: '#fff', flex: 1 },
  };
  return (
    <SafeAreaView style={styles.area}>
      <ScrollView style={styles.scroll}>{children}</ScrollView>
    </SafeAreaView>
  );
};

const Body = () => {
  const [client, setClient] = useState<LDClient | null>(null);
  const [flagKey, setFlagKey] = useState('dev-test-flag');
  const [flagType, setFlagType] = useState('bool');
  const [isOffline, setIsOffline] = useState(false);
  const [contextKey, setContextKey] = useState('context-key');
  const [listenerKey, setListenerKey] = useState('');
  const [listeners, setListeners] = useState({});

  useEffect(() => {
    async function initializeClient() {
      let ldClient = new LDClient();
      let config: LDConfig = {
        mobileKey: MOBILE_KEY,
        enableAutoEnvAttributes: true,
        debugMode: true,
        application: {
          id: 'rn-manual-test-app',
          version: '0.0.1',
        },
      };
      const userContext = {
        kind: 'user',
        key: 'test-key',
      };
      const multiContext: LDMultiKindContext = {
        kind: 'multi',
        user: userContext,
        org: {
          key: 'org-key',
          name: 'Example organization name',
          _meta: {
            privateAttributes: ['address', 'phone'],
          },
          address: {
            street: 'sunset blvd',
            postcode: 94105,
          },
          phone: 5551234,
        },
      };

      try {
        await ldClient.configure(config, multiContext);
      } catch (err) {
        console.error(err);
      }
      setClient(ldClient);
    }

    if (client == null) {
      initializeClient().then(() => console.log('ld client initialized successfully'));
    }
  });

  const evalFlag = async () => {
    let res;
    if (flagType === 'bool') {
      res = await client?.boolVariation(flagKey, false);
    } else if (flagType === 'string') {
      res = await client?.stringVariation(flagKey, '');
    } else if (flagType === 'number') {
      res = await client?.numberVariationDetail(flagKey, 33);
    } else if (flagType === 'json') {
      res = await client?.jsonVariation(flagKey, null);
    }

    Alert.alert('LD Server Response', JSON.stringify(res));
  };

  const track = () => {
    client?.track(flagKey, false);
  };

  const identify = () => {
    client?.identify({ kind: 'user', key: contextKey });
  };

  const listen = () => {
    if (listeners.hasOwnProperty(listenerKey)) {
      return;
    }
    let listener = (value: string | undefined) => Alert.alert('Listener Callback', value);
    client?.registerFeatureFlagListener(listenerKey, listener);
    setListeners({ ...listeners, ...{ [listenerKey]: listener } });
  };

  const removeListener = () => {
    // @ts-ignore
    client?.unregisterFeatureFlagListener(listenerKey, listeners[listenerKey]);
    // @ts-ignore
    let { [listenerKey]: omit, ...newListeners } = listeners;
    setListeners(newListeners);
  };

  const flush = () => {
    client?.flush();
  };

  const setOffline = (offline: boolean) => {
    if (offline) {
      client?.setOffline();
    } else {
      client?.setOnline();
    }

    setIsOffline(offline);
  };

  return (
    <>
      <Text>Feature Key:</Text>
      <TextInput style={styles.input} onChangeText={setFlagKey} value={flagKey} autoCapitalize="none" />
      <View style={styles.row}>
        <Button title="Evaluate Flag" onPress={evalFlag} />
        <Picker style={{ flex: 1 }} selectedValue={flagType} onValueChange={(itemValue) => setFlagType(itemValue)}>
          <Picker.Item label="Number" value="number" />
          <Picker.Item label="Bool" value="bool" />
          <Picker.Item label="String" value="string" />
          <Picker.Item label="JSON" value="json" />
        </Picker>
        <Text>Offline</Text>
        <Switch value={isOffline} onValueChange={setOffline} />
      </View>
      <Text>Context key:</Text>
      <TextInput style={styles.input} onChangeText={setContextKey} value={contextKey} autoCapitalize="none" />
      <View style={styles.row}>
        <Button title="Identify" onPress={identify} />
        <Button title="Track" onPress={track} />
        <Button title="Flush" onPress={flush} />
      </View>
      <Text>Feature Flag Listener Key:</Text>
      <TextInput style={styles.input} onChangeText={setListenerKey} value={listenerKey} autoCapitalize="none" />
      <View style={styles.row}>
        <Button title="Listen" onPress={listen} />
        <Button title="Remove" onPress={removeListener} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

const App = () => {
  return (
    <Wrapper>
      <Body />
    </Wrapper>
  );
};

MessageQueue.spy((msg) => {
  if (
    msg.module !== 'LaunchdarklyReactNativeClient' &&
    typeof msg.method === 'string' &&
    !msg.method.includes('LaunchdarklyReactNativeClient')
  ) {
    return;
  }
  let logMsg = msg.type === 0 ? 'N->JS: ' : 'JS->N: ';
  if (typeof msg.method !== 'number') {
    logMsg += msg.method.replace('LaunchdarklyReactNativeClient.', '');
  }

  let params = [...msg.args];
  if (params.length >= 2) {
    let cbIdSucc = params[params.length - 1];
    let cbIdFail = params[params.length - 2];
    if (
      Number.isInteger(cbIdSucc) &&
      Number.isInteger(cbIdFail) &&
      (cbIdSucc & 1) === 1 &&
      (cbIdFail & 1) === 0 &&
      cbIdSucc >>> 1 === cbIdFail >>> 1
    ) {
      params.splice(-2, 2, '<promise>');
    }
  }

  logMsg += '(' + params.map((p) => JSON.stringify(p)).join(', ') + ')';
  console.log(logMsg);
});

export default App;

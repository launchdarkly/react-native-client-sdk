import React, { useState, useEffect } from 'react';
import { SafeAreaView,
         ScrollView,
         StyleSheet,
         Text,
         View,
         Button,
         TextInput,
         Alert,
         Switch,
       } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LDClient from 'launchdarkly-react-native-client-sdk';

const Wrapper = ({children}): Node => {
  const styles = {
    scroll: { backgroundColor: '#fff', padding: 10 },
    area: { backgroundColor: '#fff', flex: 1 },
  };
  return (
    <SafeAreaView style={styles.area}>
      <ScrollView style={styles.scroll}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const Body = () => {
  const [client, setClient] = useState(null);
  const [flagKey, setFlagKey] = useState('flag-key');
  const [flagType, setFlagType] = useState('bool');
  const [isOffline, setIsOffline] = useState(false);
  const [userKey, setUserKey] = useState('user key');
  const [listenerKey, setListenerKey] = useState('');
  const [listeners, setListeners] = useState({});

  useEffect(() => {
    async function initializeClient() {
      let ldClient = new LDClient();
      let config = {
        mobileKey: 'MOBILE_KEY',
        debugMode: true,
      };
      let user = { key: userKey };
      try {
        await ldClient.configure(config, user);
      } catch (err) {
        console.error(err);
      }
      setClient(ldClient);
    }

    if (client == null) {
      initializeClient();
    }
  });

  const evalFlag = async () => {
    let res;
    if (flagType === 'bool') {
      res = await client.boolVariation(flagKey, false);
    } else if (flagType === 'string') {
      res = await client.stringVariation(flagKey, '');
    } else if (flagType === 'int') {
      res = await client.intVariation(flagKey, 0);
    } else if (flagType === 'float') {
      res = await client.floatVariation(flagKey, 0.0);
    } else if (flagType === 'array') {
      res = await client.jsonVariation(flagKey, []);
    } else if (flagType === 'object') {
      res = await client.jsonVariation(flagKey, {});
    }

    Alert.alert('LD Server Response', JSON.stringify(res));
  }

  const track = () => {
    client.track(flagKey, false);
  }

  const identify = () => {
    client.identify({ key: userKey });
  }

  const listen = () => {
    if (listeners.hasOwnProperty(listenerKey)) {
      return;
    }
    let listener = value => Alert.alert('Listener Callback', value);
    client.registerFeatureFlagListener(listenerKey, listener);
    setListeners({ ...listeners, ...{[listenerKey]: listener}});
  }

  const removeListener = () => {
    client.unregisterFeatureFlagListener(listenerKey, listeners[listenerKey]);
    let {[listenerKey]: omit, ...newListeners} = listeners;
    setListeners(newListeners);
  }

  const flush = () => { client.flush(); }

  const setOffline = (newIsOffline) => {
    if (newIsOffline) {
      client.setOffline();
    } else {
      client.setOnline();
    }
    setIsOffline(newIsOffline);
  }

  return (
    <>
      <Text>Feature Key:</Text>
      <TextInput style={styles.input}
                 onChangeText={setFlagKey} value={flagKey} />
      <View style={styles.row}>
        <Button title="Evaluate Flag" onPress={evalFlag} />
        <Picker style={{flex: 1}}
                selectedValue={flagType}
                onValueChange={(itemValue, _) => setFlagType(itemValue)}>
          <Picker.Item label="Bool" value="bool" />
          <Picker.Item label="String" value="string" />
          <Picker.Item label="Int" value="int" />
          <Picker.Item label="Float" value="float" />
          <Picker.Item label="Array" value="array" />
          <Picker.Item label="Object" value="object" />
        </Picker>
        <Text>Offline</Text>
        <Switch value={isOffline} onValueChange={setOffline} />
      </View>
      <Text>User Key:</Text>
      <TextInput style={styles.input}
                 onChangeText={setUserKey} value={userKey} />
      <View style={styles.row}>
        <Button title="Identify" onPress={identify} />
        <Button title="Track" onPress={track} />
        <Button title="Flush" onPress={flush} />
      </View>
      <Text>Feature Flag Listener Key:</Text>
      <TextInput style={styles.input}
                 onChangeText={setListenerKey}
                 value={listenerKey} />
      <View style={styles.row}>
        <Button title="Listen" onPress={listen}/>
        <Button title="Remove" onPress={removeListener}/>
      </View>
    </>
  );
}

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
}

export default App;

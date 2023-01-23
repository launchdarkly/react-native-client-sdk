#!/bin/bash

echo "===== Installing all dependencies..."
yarn

declare -a examples=(ManualTestApp)

for example in "${examples[@]}"
do
  echo "===== Linking to $example"
  mkdir -p ${example}/node_modules
  rm -rf ${example}/node_modules/launchdarkly-react-native-client-sdk
  mkdir -p ${example}/node_modules/launchdarkly-react-native-client-sdk/node_modules
  cp package.json ${example}/node_modules/launchdarkly-react-native-client-sdk/package.json
  cp index.js ${example}/node_modules/launchdarkly-react-native-client-sdk/index.js
  cp launchdarkly-react-native-client-sdk.podspec ${example}/node_modules/launchdarkly-react-native-client-sdk/launchdarkly-react-native-client-sdk.podspec
  cp LICENSE ${example}/node_modules/launchdarkly-react-native-client-sdk/LICENSE
  cp -r node_modules/ ${example}/node_modules/launchdarkly-react-native-client-sdk/node_modules/
  cp -r ios/ ${example}/node_modules/launchdarkly-react-native-client-sdk/ios
  cp -r android/ ${example}/node_modules/launchdarkly-react-native-client-sdk/android
done

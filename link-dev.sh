#!/bin/bash

echo "===== Installing all dependencies..."
yarn

declare -a examples=(ManualTestApp)

for example in "${examples[@]}"
do
  echo "===== Linking to $example"
  MODULES_DIR=$example/node_modules
  SDK_DIR=$MODULES_DIR/launchdarkly-react-native-client-sdk

  mkdir -p "$MODULES_DIR"
  rm -rf "$SDK_DIR"
  mkdir -p "$SDK_DIR"/node_modules

  rsync -aq package.json "$SDK_DIR"
  rsync -aq index.js "$SDK_DIR"
  rsync -aq index.d.ts "$SDK_DIR"
  rsync -aq launchdarkly-react-native-client-sdk.podspec "$SDK_DIR"
  rsync -aq LICENSE "$SDK_DIR"
  rsync -aq node_modules "$SDK_DIR"
  rsync -av ios "$SDK_DIR" --exclude LaunchdarklyReactNativeClient.xcworkspace --exclude build --exclude Pods --exclude Tests --exclude Podfile --exclude Podfile.lock
  rsync -av android "$SDK_DIR" --exclude .gradle --exclude build --exclude .idea --exclude gradle --exclude src/test
  rsync -av src "$SDK_DIR"
done

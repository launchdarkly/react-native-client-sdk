#!/usr/bin/env bash

sed  -i.bak "s/\( *\)s\.version\( *\)=\( *\)\".*\"/\1s\.version\2=\3\"${LD_RELEASE_VERSION}\"/" ios/LaunchdarklyReactNativeClient.podspec
rm -f ios/LaunchdarklyReactNativeClient.podspec.bak

sed  -i.bak "s/\( *\)\"version\"\( *\):\( *\)\".*\"/\1\"version\"\2:\3\"${LD_RELEASE_VERSION}\"/" package.json
rm -f package.json.bak

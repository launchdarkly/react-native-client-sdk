#!/bin/bash
# Ripped from: https://gist.githubusercontent.com/townofdon/087c7c0bb773adb158f20339c7e13408/raw/53ccb3430cf870c3cdeecead82bc12c3644f2f53/react-native-nuke.sh
# ReactNative script to clean all the things
# usage:
# - add each item below as a separate script in package.json
# - add one final script:
#   - "clean": "yarn clean-node-modules && yarn clean-pods && yarn clean-ios && yarn clean-android && yarn clean-rn-cache"
# - alternatively, copy this shell script and add the following cmd to package.json:
#   - "clean": "./react-native-clean-sh"
#   - you may need to run `sudo chmod 777 ./react-native-clean-sh before this script can run`

echo "                              ____                      "
echo "                      __,-~~/~    \`---.                 "
echo "                    _/_,---(      ,    )                "
echo "                __ /        <    /   )  \___            "
echo "               ====------------------===;;;==           "
echo "                   \/  ~\"~\"~\"~\"~\"~\~\"~)~\",1/            "
echo "                   (_ (   \  (     >    \)              "
echo "                    \_( _ <         >_>'                "
echo "                       ~ \`-i' ::>|--\"                   "
echo "                           I;|.|.|                      "
echo "                          <|i::|i|>                     "
echo "                           |[::|.|                      "
echo "                            ||: |                       "
echo "______________________REACT NATIVE CLEAN ALL________________ "

# clean-node-modules
rm -rf node_modules && yarn

# clean-pods
cd ios/ &&  pod cache clean --all && pod deintegrate && rm -rf Pods && rm -rf Podfile.lock && pod install && cd ../

# clean-ios
rm -rf ios/build && rm -rf ~/Library/Developer/Xcode/DerivedData && rm -rf ./ios/DerivedData

# clean-android
cd android && ./gradlew clean && cd ..

# clean-rn-cache
rm -rf $TMPDIR/react-* && rm -rf $TMPDIR/react-native-packager-cache-* && rm -rf $TMPDIR/metro-bundler-cache-* && yarn cache clean && watchman watch-del-all

cd ManualTestApp && react-native start --reset-cache && cd ..

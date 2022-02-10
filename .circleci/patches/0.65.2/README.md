## Patch for React Native project template 0.65.2

After XCode 12.5, the `RCT-Folly` transitive dependency causes build errors. This patch overrides
some of `RCT-Folly`'s build configurations by patching the template's `Podfile`. See
[facebook/folly#1470](https://github.com/facebook/folly/issues/1470) for more details.

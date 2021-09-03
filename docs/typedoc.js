module.exports = {
  out: './docs/build/html',
  exclude: [
    '**/node_modules/**',
    'test-types.ts'
  ],
  name: "LaunchDarkly Client-Side SDK for React Native (5.0.1)",
  readme: 'none',                // don't add a home page with a copy of README.md
  mode: 'file',                  // don't treat "index.d.ts" itself as a parent module
  includeDeclarations: true,     // allows it to process a .d.ts file instead of actual TS code
  entryPoint: '"launchdarkly-react-native-client-sdk"'  // note extra quotes - workaround for a TypeDoc bug
};

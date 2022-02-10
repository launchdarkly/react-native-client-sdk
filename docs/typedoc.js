module.exports = {
  out: '/tmp/project-releaser/project/docs/build/html',
  exclude: [
    '**/node_modules/**',
    'test-types.ts'
  ],
  name: "LaunchDarkly Client-Side SDK for React Native (6.0.0)",
  readme: 'none',                // don't add a home page with a copy of README.md
  entryPoints: "/tmp/project-releaser/project/index.d.ts",
  entryPointStrategy: "expand"
};

## Patches for running React Native application templates in CI

Some versions of the React Native project templates no longer function without modification with
newer XCode. We verify this library builds against supported versions of React Native in the
[CircleCI configuration](../.circleci/config.yml) by building the project templates with the SDK
added as a dependency. This directory contains the required files to patch each project template
that we are testing that does not work without modification.

Before installing the dependencies and integrating the SDK into the project, the CI jobs checks here
for a directory with the name of the React Native project template version that is being tested. If
the directory exists, the files are copied into the project. Then, if an executable file called
`patch.sh` now exists in the project template, it is run.

Further details of what patching is required is included in each version's subdirectory.

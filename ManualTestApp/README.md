## Example app

To run the example app:

1. Create a `.env` file at the same level as this README
2. Add your mobile key to that `.env` file:

```shell
MOBILE_KEY=mob-xxx
```

3.  Finally

```shell
# android
yarn && yarn android

# ios
yarn && npx pod-install && yarn ios
```

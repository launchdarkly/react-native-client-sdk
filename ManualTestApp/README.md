## Example app

To run the example app:

1. Ensure `yarn doctor` are all green.
2. Create a `.env` file at the same level as this README
3. Add your mobile key to that `.env` file:

```shell
MOBILE_KEY=mob-xxx
```

4. Finally

```shell
# android
yarn && yarn android

# ios
yarn && npx pod-install && yarn ios
```

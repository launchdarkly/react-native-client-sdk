import { LDContext, LDMultiKindContext, LDSingleKindContext } from 'launchdarkly-js-sdk-common';
import { isAnonymousAndNoKey, isContext, validateContext } from './contextUtils';
import { LDUser } from 'launchdarkly-react-native-client-sdk';

describe('contextUtils', () => {
  describe('isContext', () => {
    test('single context', () => {
      const c: LDSingleKindContext = { kind: 'car', key: 'blr34F', color: 'red' };
      expect(isContext(c)).toBeTruthy();
    });

    test('multi context', () => {
      const c: LDMultiKindContext = { kind: 'multi' };
      expect(isContext(c)).toBeTruthy();
    });

    test('anonymous context', () => {
      const c = { kind: 'car', key: 'blr34F', color: 'red', anonymous: true };
      expect(isContext(c)).toBeTruthy();
    });

    test('legacy user', () => {
      const c = { key: 'yus', custom: { country: 'Australia' } };
      expect(isContext(c)).toBeFalsy();
    });

    test('anonymous legacy user', () => {
      const c = { anonymous: true };
      expect(isContext(c)).toBeFalsy();
    });
  });

  describe('isAnonymousAndNoKey', () => {
    test('anonymous no key', () => {
      const c = { kind: 'car', anonymous: true };
      expect(isAnonymousAndNoKey(c)).toBeTruthy();
    });

    test('anonymous with key', () => {
      const c = { kind: 'car', key: 'blr34F', anonymous: true };
      expect(isAnonymousAndNoKey(c)).toBeFalsy();
    });

    test('known user', () => {
      const c = { kind: 'car', key: 'blr34F' };
      expect(isAnonymousAndNoKey(c)).toBeFalsy();
    });
  });

  describe('validateContext', () => {
    test('undefined, null, empty context', () => {
      expect(validateContext(undefined as any as LDContext)).toBeFalsy();
      expect(validateContext(null as any as LDContext)).toBeFalsy();
      expect(validateContext({})).toBeFalsy();
    });

    test('inject key for legacy anonymous user', () => {
      const legacyUser: LDUser = { anonymous: true };
      const isValid = validateContext(legacyUser);

      expect(isValid).toBeTruthy();
    });

    test('inject key for anonymous single context', () => {
      const c = { kind: 'car', key: 'blr34F', anonymous: true };
      const isValid = validateContext(c);

      expect(c.key).toEqual('blr34F');
      expect(isValid).toBeTruthy();
    });

    test('inject key for multi anonymous context', () => {
      // @ts-ignore
      const c: LDMultiKindContext = { kind: 'multi', car: { anonymous: true }, bus: { key: 'bbb-555' } };
      const isValid = validateContext(c);

      expect(isValid).toBeTruthy();
    });
  });
});

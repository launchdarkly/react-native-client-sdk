import { LDContext } from 'launchdarkly-js-sdk-common';

/**
 * Returns true if the argument has anonymous true and has no key.
 *
 * @param LDContext
 * @returns {boolean}
 */
export function isAnonymousAndNoKey(context: LDContext) {
  const key = context.key?.trim() ?? '';
  const anonymousTrue = context.anonymous === true;
  const isKeySpecified = key !== '';

  return !isKeySpecified && anonymousTrue;
}

/**
 * A basic check to validate if a context is valid. This will be expanded
 * to be more thorough in the future.
 *
 * @param LDContext
 * @returns {boolean}
 */
export function validateContext(context: LDContext) {
  if (!context || Object.keys(context).length === 0) {
    return false;
  }

  return true;
}

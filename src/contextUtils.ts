import { LDContext } from 'launchdarkly-js-sdk-common';

/**
 * Returns true if argument is an LDContext object. Otherwise returns false
 * signalling the argument is an LDUser.
 *
 * @param x - the object suspected to be an LDContext
 * @returns {boolean}
 */
export function isContext(x: LDContext) {
  let kind = (x as any).kind;
  if (!x || !kind) {
    return false;
  }

  kind = kind.trim();
  const key = x.key?.trim() ?? '';
  const isKeySpecified = key !== '';
  const isKindSpecified = kind !== '';
  const isKindMulti = kind === 'multi';
  const anonymousTrue = x.anonymous === true;

  return (isKindSpecified && (isKeySpecified || anonymousTrue)) || isKindMulti;
}

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

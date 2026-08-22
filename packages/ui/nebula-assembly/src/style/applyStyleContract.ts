import type { StyleContract } from '../types/style';

import {
  STYLE_CONTRACT_ATTR,
  STYLE_CSS_ATTR,
  STYLE_DENSITY_ATTR,
  STYLE_NAMESPACE_ATTR,
  STYLE_THEME_ATTR,
} from '../types/style';

function setOrRemoveAttribute(
  root: HTMLElement,
  name: string,
  value: string | undefined,
): void {
  if (value === undefined || value === '') {
    root.removeAttribute(name);
    return;
  }
  root.setAttribute(name, value);
}

/**
 * Apply style contract to the given mount root only.
 * Never touches document.documentElement or document.body.
 */
export function applyStyleContract(
  root: HTMLElement,
  contract: StyleContract,
): void {
  root.setAttribute(STYLE_CONTRACT_ATTR, '');
  applyOverlayStyleAttrs(root, contract);
}

/** Theme/density/namespace only — used by the body-level overlay portal. */
export function applyOverlayStyleAttrs(
  root: HTMLElement,
  contract: StyleContract,
): void {
  setOrRemoveAttribute(root, STYLE_THEME_ATTR, contract.theme);
  setOrRemoveAttribute(root, STYLE_DENSITY_ATTR, contract.density);
  setOrRemoveAttribute(root, STYLE_NAMESPACE_ATTR, contract.namespace);
  setOrRemoveAttribute(root, STYLE_CSS_ATTR, contract.namespace);
}

export function clearStyleContract(root: HTMLElement): void {
  root.removeAttribute(STYLE_CONTRACT_ATTR);
  root.removeAttribute(STYLE_THEME_ATTR);
  root.removeAttribute(STYLE_DENSITY_ATTR);
  root.removeAttribute(STYLE_NAMESPACE_ATTR);
  root.removeAttribute(STYLE_CSS_ATTR);
}

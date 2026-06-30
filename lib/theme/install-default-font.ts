import { cloneElement } from 'react';
import { Platform, StyleSheet, Text, TextInput } from 'react-native';

import { fontFamilyForWeight } from './fonts';

/**
 * Applies Geist as the app-wide default font on native by injecting a
 * weight-aware `fontFamily` into every `Text` / `TextInput`. Explicit
 * `fontFamily` on a component (e.g. icon fonts) always wins. On web this is a
 * no-op — `global.css` sets the document font instead.
 */
let installed = false;

export function installDefaultFont(): void {
  if (installed || Platform.OS === 'web') {
    return;
  }
  installed = true;
  patchComponent(Text as unknown as PatchableComponent);
  patchComponent(TextInput as unknown as PatchableComponent);
}

type PatchableComponent = {
  render?: (...args: unknown[]) => any;
  __geistPatched?: boolean;
};

function patchComponent(Component: PatchableComponent): void {
  if (!Component || typeof Component.render !== 'function' || Component.__geistPatched) {
    return;
  }
  const originalRender = Component.render;
  Component.render = function patchedRender(...args: unknown[]) {
    const element = originalRender.apply(this, args);
    if (!element || !element.props) {
      return element;
    }
    const flattened = StyleSheet.flatten(element.props.style) || {};
    const fontFamily = flattened.fontFamily ?? fontFamilyForWeight(flattened.fontWeight);
    return cloneElement(element, {
      style: [{ fontFamily }, element.props.style],
    });
  };
  Component.__geistPatched = true;
}

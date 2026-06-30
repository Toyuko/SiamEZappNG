import { Platform, StyleSheet, Text, TextInput } from 'react-native';

import { fontFamilyForWeight } from './fonts';

const isWeb = Platform.OS === 'web';

/**
 * Applies Geist as the app-wide default font by injecting a weight-aware
 * `fontFamily` into every `Text` / `TextInput` that doesn't already specify one.
 *
 * This is needed on web too: react-native-web otherwise applies its own system
 * font stack (as a generated class) to each text node, which overrides
 * document-level CSS. We patch the component's `render` and adjust the *input*
 * props (where styles are still plain RN objects) so the correct Geist weight is
 * picked, and so components that set their own `fontFamily` (e.g. icon fonts) are
 * left untouched.
 */
let installed = false;

export function installDefaultFont(): void {
  if (installed) {
    return;
  }
  installed = true;
  patchComponent(Text as unknown as PatchableComponent);
  patchComponent(TextInput as unknown as PatchableComponent);
}

type PatchableComponent = {
  render?: (props: any, ref: unknown) => any;
  __geistPatched?: boolean;
};

function patchComponent(Component: PatchableComponent): void {
  if (!Component || typeof Component.render !== 'function' || Component.__geistPatched) {
    return;
  }
  const originalRender = Component.render;
  Component.render = function patchedRender(props: any, ref: unknown) {
    const flattened = StyleSheet.flatten(props?.style) || {};
    if (!flattened.fontFamily) {
      // On web, Geist is a multi-weight web font (global.css), so the existing
      // `fontWeight` (including NativeWind classes) resolves the real weight.
      // On native we map to the matching loaded Geist family.
      const fontFamily = isWeb ? 'Geist' : fontFamilyForWeight(flattened.fontWeight);
      props = { ...props, style: [props?.style, { fontFamily }] };
    }
    return originalRender.call(this, props, ref);
  };
  Component.__geistPatched = true;
}

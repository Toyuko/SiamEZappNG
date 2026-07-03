/**
 * Geist typography — matches the SiamEZ website (Vercel Geist font).
 * The web target also wires Geist up via `global.css`; on native we map the
 * common `fontWeight` values to the matching Geist family (see
 * `install-default-font.ts`).
 */

export const fontFamilies = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
} as const;

/** Maps a React Native `fontWeight` to the matching loaded Geist family. */
export function fontFamilyForWeight(weight?: string | number | null): string {
  const value = weight == null ? '400' : String(weight);
  switch (value) {
    case '500':
      return fontFamilies.medium;
    case '600':
      return fontFamilies.semibold;
    case '700':
    case '800':
    case '900':
    case 'bold':
      return fontFamilies.bold;
    default:
      return fontFamilies.regular;
  }
}

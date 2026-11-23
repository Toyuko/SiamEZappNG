const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Google Play treats implied features from portrait orientation and Wi-Fi
 * permissions as required, which hides the app on XR, desktop, and some
 * tablets. Explicitly mark them optional so filtering does not apply.
 */
const OPTIONAL_FEATURES = [
  "android.hardware.screen.portrait",
  "android.hardware.wifi",
];

function ensureOptionalFeature(manifest, name) {
  if (!manifest["uses-feature"]) {
    manifest["uses-feature"] = [];
  }

  const features = manifest["uses-feature"];
  const existing = features.find((f) => f?.$?.["android:name"] === name);

  if (existing) {
    existing.$["android:required"] = "false";
    return;
  }

  features.push({
    $: {
      "android:name": name,
      "android:required": "false",
    },
  });
}

function withAndroidOptionalFeatures(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    for (const name of OPTIONAL_FEATURES) {
      ensureOptionalFeature(manifest, name);
    }

    return mod;
  });
}

module.exports = withAndroidOptionalFeatures;

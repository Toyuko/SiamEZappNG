const { withAppBuildGradle } = require("expo/config-plugins");

const KEYSTORE_LOAD = `
def siamezKeystorePropertiesFile = rootProject.file("../credentials/android/keystore.properties")
def siamezKeystoreProperties = new Properties()
if (siamezKeystorePropertiesFile.exists()) {
    siamezKeystorePropertiesFile.withInputStream { siamezKeystoreProperties.load(it) }
}
`;

const RELEASE_SIGNING_CONFIG = `        release {
            if (siamezKeystorePropertiesFile.exists()) {
                keyAlias siamezKeystoreProperties['keyAlias']
                keyPassword siamezKeystoreProperties['keyPassword']
                storeFile rootProject.file("../credentials/android/" + siamezKeystoreProperties['storeFile'])
                storePassword siamezKeystoreProperties['storePassword']
            }
        }
`;

/**
 * Signs Android release builds with credentials/android/siamez-release.keystore
 * when keystore.properties is present. Debug builds stay on the debug keystore.
 */
function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (contents.includes("siamezKeystorePropertiesFile")) {
      return mod;
    }

    contents = contents.replace("android {", `${KEYSTORE_LOAD}\nandroid {`);

    if (!contents.includes("signingConfigs.release") && contents.includes("keyAlias 'androiddebugkey'")) {
      contents = contents.replace(
        /keyPassword 'android'\n        \}/,
        `keyPassword 'android'\n        }\n${RELEASE_SIGNING_CONFIG}`
      );
    }

    contents = contents.replace(
      /\/\/ Caution! In production, you need to generate your own keystore file\.\n\s*\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\n\s*signingConfig signingConfigs\.debug/,
      "signingConfig siamezKeystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug"
    );

    mod.modResults.contents = contents;
    return mod;
  });
}

module.exports = withAndroidReleaseSigning;

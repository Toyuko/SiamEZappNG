module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta lets Metro bundle ESM deps that use
      // `import.meta` (e.g. zustand/middleware) for the web target. Becomes
      // the default in Expo SDK 56; safe no-op on native.
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};

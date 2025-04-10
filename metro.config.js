const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for expo-router
config.resolver.assetExts.push('cjs');

module.exports = config; 
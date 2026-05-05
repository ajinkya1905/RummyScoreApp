import { Platform } from 'react-native';

// ============================================================
// DEBUG FLAGS - Toggle these for easy local testing
// ============================================================

// Set to true to hide all ads (simulates "Remove Ads" purchase)
// Set to false to show ads normally
export const DEBUG_FORCE_ADS_REMOVED = false;

// Set to true to always show ads (even if user purchased remove ads)
// Useful for testing ad placement/styling
export const DEBUG_FORCE_SHOW_ADS = false;

// ============================================================

// AdMob Test Ad Unit IDs (Use these for development)
// Replace with your real ad unit IDs before publishing
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';

// Production Ad Unit IDs
// Get these from your AdMob dashboard: https://admob.google.com
const PROD_BANNER_ANDROID = 'ca-app-pub-9985947780680080/7693217408';
const PROD_BANNER_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-9985947780680080/5537738068';
const PROD_INTERSTITIAL_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

// Set to false for production release
const USE_TEST_ADS = __DEV__;

export const AD_UNIT_IDS = {
  BANNER: Platform.select({
    android: USE_TEST_ADS ? TEST_BANNER_ANDROID : PROD_BANNER_ANDROID,
    ios: USE_TEST_ADS ? TEST_BANNER_IOS : PROD_BANNER_IOS,
  }),
  INTERSTITIAL: Platform.select({
    android: USE_TEST_ADS ? TEST_INTERSTITIAL_ANDROID : PROD_INTERSTITIAL_ANDROID,
    ios: USE_TEST_ADS ? TEST_INTERSTITIAL_IOS : PROD_INTERSTITIAL_IOS,
  }),
};

// In-App Purchase Product IDs
// Set these up in Google Play Console under Monetization > Products > In-app products
export const IAP_PRODUCTS = {
  REMOVE_ADS: Platform.select({
    android: 'remove_ads',
    ios: 'com.ajinkya.rummyscore.removeads',
  }),
};

// Purchase verification
export const STORAGE_KEYS = {
  ADS_REMOVED: '@rummy_score_ads_removed',
};

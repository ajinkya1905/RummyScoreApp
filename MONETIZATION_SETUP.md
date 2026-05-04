# Monetization Setup Guide

This guide explains how to set up ads and in-app purchases for the Rummy Score app.

## Overview

The app uses:
- **Google AdMob** for banner ads
- **Google Play Billing** for in-app purchases (Remove Ads)

Currently configured with **test ad IDs** for development. Before publishing, you must replace these with your real AdMob credentials.

---

## Step 1: Create AdMob Account

1. Go to [Google AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Complete the account setup

## Step 2: Create AdMob App

1. In AdMob dashboard, go to **Apps** → **Add App**
2. Select **Android** as the platform
3. Enter app name: `Rummy Score`
4. Select **No** if not published yet
5. Save the **App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

## Step 3: Create Ad Units

### Banner Ad Unit
1. Go to your app in AdMob
2. Click **Ad units** → **Add ad unit**
3. Select **Banner**
4. Name it: `Home Banner` or `Game Banner`
5. Save the **Ad unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

## Step 4: Update App Configuration

### Update app.json (AdMob App ID)
Replace the test App IDs with your real ones:

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-YOUR_REAL_APP_ID~YOUR_ID",
      "iosAppId": "ca-app-pub-YOUR_REAL_APP_ID~YOUR_ID"
    }
  ]
]
```

### Update src/constants/ads.js (Ad Unit IDs)
Replace the production ad unit IDs:

```javascript
// Production Ad Unit IDs - REPLACE THESE WITH YOUR REAL IDs
const PROD_BANNER_ANDROID = 'ca-app-pub-YOUR_ID/YOUR_BANNER_UNIT_ID';
const PROD_BANNER_IOS = 'ca-app-pub-YOUR_ID/YOUR_BANNER_UNIT_ID';
```

---

## Step 5: Set Up In-App Purchase

### In Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create it if not done)
3. Go to **Monetization** → **Products** → **In-app products**
4. Click **Create product**
5. Configure:
   - **Product ID**: `remove_ads` (must match exactly)
   - **Name**: Remove Ads
   - **Description**: Remove all banner ads from the app
   - **Price**: $1.99 (or your preferred price)
6. **Activate** the product

### Important Notes
- The app must be uploaded to Play Console first (even in internal testing)
- IAP won't work until the app is published to at least internal testing track
- Use a test device added to your license testing list for testing purchases

---

## Step 6: Testing

### Test Ads (Development)
The app uses test ad IDs by default in development mode (`__DEV__` is true). Ads will show as "Test Ad" banners.

### Test Purchases
1. Add your test Google accounts in Play Console:
   - Go to **Setup** → **License testing**
   - Add email addresses of test accounts
2. Test accounts can make purchases without being charged
3. Test on a physical device (emulators don't support IAP well)

---

## Step 7: Rebuild for Production

After updating the ad IDs, rebuild the app:

```bash
cd android
./gradlew bundleRelease
```

The new AAB will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Files Modified for Monetization

| File | Purpose |
|------|---------|
| `app.json` | AdMob and IAP plugin configuration |
| `src/constants/ads.js` | Ad unit IDs and IAP product IDs |
| `src/context/AdContext.js` | Ad state management and IAP logic |
| `src/components/BannerAd.js` | Banner ad component |
| `src/screens/SettingsScreen.js` | Premium/settings screen with purchase UI |
| `src/screens/HomeScreen.js` | Banner ad + settings button added |
| `src/screens/HistoryScreen.js` | Banner ad added |
| `App.js` | AdProvider wrapper added |

---

## Revenue Expectations

### Typical AdMob earnings (banner ads):
- eCPM: $0.10 - $1.00 per 1000 impressions
- Active user: ~5-10 ad views per session
- ~10,000 DAU → ~$5-50/day

### IAP Revenue:
- 2-5% conversion rate typical for "Remove Ads"
- Price: $1.99 → ~$1.40 after Google's 15-30% cut

---

## Troubleshooting

### Ads not showing?
1. Verify you're not in Airplane mode
2. Check console logs for error messages
3. Wait 24-48 hours for new ad units to start serving
4. Ensure ad unit ID matches exactly (no extra spaces)

### IAP not working?
1. App must be published to at least internal testing
2. Use a device, not emulator
3. Test account must be in License Testing list
4. Product must be "Active" status in Play Console
5. Wait a few hours after creating the product

---

## Quick Reference

```
Ad Unit IDs (Test - Development):
  Banner Android: ca-app-pub-3940256099942544/6300978111
  Banner iOS: ca-app-pub-3940256099942544/2934735716

IAP Product ID:
  Android: remove_ads
  iOS: com.rummyscore.app.removeads
```

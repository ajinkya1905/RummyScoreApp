# Rummy Score App - project context

Expo / React Native (RN 0.81, Expo 54, new arch) score tracker for Indian Rummy. Android only in practice
(iOS IDs are placeholders). Play package `com.ajinkya.rummyscore`. Plain JS, no TypeScript, no tests.

## Structure
- `App.js` native-stack navigator; providers `AdProvider` > `GameProvider`.
- `src/context/GameContext.js` reducer + AsyncStorage persistence (`src/utils/storage.js`). Game modes:
  `points` (elimination at targetScore), `pool101`, `pool201`, `deals`. Max 7 players, re-entry, drop points 20/40/80.
  Round `scores` is `{playerId: points}`; the round winner has exactly one 0.
- `src/context/AdContext.js` AdMob interstitials + `react-native-iap` "remove_ads" (non-consumable).
  Play purchase state is authoritative: no purchase -> cached `@rummy_score_ads_removed` flag is cleared.
- `src/utils/settlement.js` Points Rummy settlement: per round losers pay the round winner their points, netted,
  then exact minimum transfers (subset DP). UI `src/components/SettlementCard.js` on Game Details.
- `docs/` = GitHub Pages privacy policy (https://ajinkya1905.github.io/RummyScoreApp/).

## Ads / AdMob (policy-sensitive)
- AdMob app `ca-app-pub-9985947780680080~8182102024` (the one linked to Play). Units: banner `/8675685379`,
  interstitial `/8922971070` in `src/constants/ads.js`; app ID in `app.json` AND `android/app/src/main/AndroidManifest.xml`.
  Old unlinked app `~1462850977` must not be used.
- `__DEV__` builds use Google test IDs. Never tap real ads on own device.
- Policy "more ads than content" (2026-11): no banners on empty/navigation screens, no interstitials on menu taps,
  interstitials capped to 1 per 3 min (`INTERSTITIAL_MIN_INTERVAL_MS`). Keep it that way.
- app-ads.txt lives in separate repo `ajinkya1905/ajinkya1905.github.io` (served at domain root);
  Play listing developer website must be `https://ajinkya1905.github.io`.

## Release
1. Bump `version` + `android.versionCode` in `app.json` AND `versionName`/`versionCode` in `android/app/build.gradle`.
2. `cd android; $env:JAVA_TOOL_OPTIONS='-Djava.net.preferIPv4Stack=true'; .\gradlew.bat bundleRelease` (~3 min incremental).
3. Upload `android/app/build/outputs/bundle/release/app-release.aab` in Play Console (user does this).
- Signing passwords: `%USERPROFILE%\.gradle\gradle.properties` (`RUMMY_UPLOAD_STORE_PASSWORD`, `RUMMY_UPLOAD_KEY_PASSWORD`).
  NEVER put secrets in tracked files - this repo is PUBLIC. Keystore `android/app/rummy-release-key.keystore` is not tracked.
- `android/` is gitignored but some files are tracked: stage them with `git add -f`.
- Quick JS compile check: `npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output <tmp>`.

## Workflow
- Feature backlog in `Todo.txt`: fix items one by one and write a `Status:` line under each.
- User publishes builds and handles Play Console / AdMob UI himself; ask before force-pushing.

## History
- 2026-04/05: initial app, modes, dealer rotation, AdMob + Remove Ads IAP, interstitials (v1.0.3-1.0.5).
- 2026-11-25: AdMob policy fixes + restore-ads fix (1.0.17), switched to store-linked AdMob app (1.0.18),
  Points Rummy settlement (1.0.19). Leaked signing password scrubbed from history (filter-repo + force push).
- OPEN: release keystore was also public (commit 9ea3fab, `rummy-release-key.keystore.backup`) -> upload key reset in
  Play Console required; new keystore replaces `android/app/rummy-release-key.keystore`.

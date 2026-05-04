# Rummy Score App

A mobile app for tracking scores in Rummy card games. Built with React Native and Expo.

## Features

- **Multiple Game Modes**: Points Rummy, Pool 101, Pool 201, and Deals Rummy
- **Player Management**: Add and manage players with custom avatars
- **Score Tracking**: Track scores round by round with running totals
- **Dealer Rotation**: Visual indicator showing who deals next (rotates each round)
- **Drop Points**: Configurable drop, middle drop, and full points values
- **Round Editing**: Edit scores for any previous round
- **Multiple Games**: Run multiple games simultaneously
- **Game History**: View completed games and detailed scorecards
- **Offline Storage**: All data persists locally on device

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For Android: [Android Studio](https://developer.android.com/studio) with an emulator or physical device
- For iOS: Xcode (macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ajinkya1905/RummyScoreApp.git
   cd RummyScoreApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Scan QR code with Expo Go app on your phone

### Building APK (Android)

To build a standalone APK:

```bash
# Generate android folder if not present
npx expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`

### Release Build Configuration

For signed release builds, create `android/local.properties` with your keystore passwords:

```properties
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password
```

This file is gitignored to keep passwords out of version control.

## Project Structure

```
RummyScoreApp/
├── App.js                 # App entry point with navigation
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.js
│   │   ├── GameModeCard.js
│   │   ├── PlayerCard.js
│   │   └── ScoreInput.js
│   ├── context/
│   │   └── GameContext.js # State management with React Context
│   ├── screens/           # App screens
│   │   ├── HomeScreen.js
│   │   ├── GameSetupScreen.js
│   │   ├── GameScreen.js
│   │   ├── PlayersScreen.js
│   │   ├── ActiveGamesScreen.js
│   │   ├── HistoryScreen.js
│   │   └── GameDetailScreen.js
│   ├── styles/
│   │   └── theme.js       # Colors, spacing, typography
│   └── utils/
│       └── storage.js     # AsyncStorage utilities
├── assets/                # App icons and images
└── android/               # Native Android project
```

## Tech Stack

- **React Native** with **Expo SDK 54**
- **React Navigation** for screen navigation
- **React Context API** for state management
- **AsyncStorage** for local data persistence
- **Google AdMob** for banner ads
- **react-native-iap** for in-app purchases

## Game Modes

| Mode | Description |
|------|-------------|
| Points Rummy | Play until a target score is reached |
| Pool 101 | Players eliminated at 101 points |
| Pool 201 | Players eliminated at 201 points |
| Deals Rummy | Fixed number of deals |

## Monetization

The app uses a **Free + Ads + Remove Ads IAP** model:
- Banner ads displayed on Home and History screens
- One-time purchase to remove all ads

### Debug Flags

For easier local testing, edit `src/constants/ads.js`:

```javascript
// Set to true to hide all ads (simulates premium)
export const DEBUG_FORCE_ADS_REMOVED = false;

// Set to true to always show ads (ignore purchase status)
export const DEBUG_FORCE_SHOW_ADS = false;
```

| Scenario | `DEBUG_FORCE_ADS_REMOVED` | `DEBUG_FORCE_SHOW_ADS` |
|----------|---------------------------|------------------------|
| Normal behavior | `false` | `false` |
| Test ad-free experience | `true` | `false` |
| Always show ads for testing | `false` | `true` |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

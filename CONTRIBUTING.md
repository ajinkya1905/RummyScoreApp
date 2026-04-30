# Contributing to Rummy Score App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)
- [Code Style](#code-style)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RummyScoreApp.git
   cd RummyScoreApp
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ajinkya1905/RummyScoreApp.git
   ```

## Development Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS (macOS only)
npx expo start --ios
```

### Build APK for Testing

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

## Making Changes

1. **Sync with upstream** before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Use prefixes like:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation updates
   - `refactor/` for code refactoring

3. **Make your changes** and test thoroughly

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```
   
   Write clear commit messages:
   - Use present tense ("Add feature" not "Added feature")
   - Keep the first line under 72 characters
   - Reference issue numbers if applicable (e.g., "Fix #123")

## Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Guidelines**:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Keep PRs focused on a single change

4. **Address review feedback** if requested

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: 
  1. Step one
  2. Step two
  3. ...
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**:
  - Device/Emulator model
  - OS version
  - App version
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you envision it working
- **Alternatives Considered**: Other solutions you've thought of

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Code Style

### General Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── context/        # React Context providers
├── styles/         # Theme and shared styles
└── utils/          # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PlayerCard.js`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `GAME_MODES`)
- **Files**: PascalCase for components, camelCase for utilities

### Styling

- Use the theme constants from `src/styles/theme.js`
- Use StyleSheet.create for styles
- Keep styles at the bottom of component files

## Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Reach out to the maintainers

Thank you for contributing! 🎴

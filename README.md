# Quran Surahs App

A mobile application focused on the last 10 Surahs of the Quran, built using React Native and Expo.

## Features

### Core Functionality

- Display Surahs with:
  - Arabic text
  - Urdu and English translations
  - Tafseer in Urdu
- FlatList for efficient rendering
- Settings screen to:
  - Toggle Tafseer on/off
  - Switch between Urdu and English translation

### Surah Navigation

- App opens with Surah Al-Fil (105)
- Scroll behavior:
  - Scrolling down loads the next Surah
  - Circular navigation: Surah An-Naas loops to Surah Al-Fil
- Pull-to-Refresh loads the previous Surah

### Additional Features

- Data from two JSON files merged and stored locally
- Persistent settings across app sessions
- Architecture using Context API and Custom Hooks
- Opens to the last read Surah and Ayah position

## Installation

```
# Clone the repository
git clone <repository-url>

# Install dependencies
cd MidLabAppExpo
npm install

# Start the Expo development server
npm start
```

## Project Structure

- `app/` - Contains the main app screens and navigation
- `components/` - Reusable UI components
- `context/` - Context providers for state management
- `hooks/` - Custom hooks for data operations
- `assets/data/` - JSON data files for Surahs

## Technologies Used

- React Native
- Expo Router for navigation
- Context API for state management
- AsyncStorage for local data persistence

## Credits

Created for Mobile Application Development (LAB) - CSC303

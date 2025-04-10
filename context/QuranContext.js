import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const QuranContext = createContext();

export const QuranProvider = ({ children }) => {
  // App settings
  const [showTafseer, setShowTafseer] = useState(true);
  const [language, setLanguage] = useState("english"); // 'english' or 'urdu'
  const [surahs, setSurahs] = useState([]);
  const [lastReadSurah, setLastReadSurah] = useState(105); // Default to Surah Al-Fil (105)
  const [lastReadAyah, setLastReadAyah] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedShowTafseer = await AsyncStorage.getItem("showTafseer");
        const storedLanguage = await AsyncStorage.getItem("language");
        const storedLastReadSurah = await AsyncStorage.getItem("lastReadSurah");
        const storedLastReadAyah = await AsyncStorage.getItem("lastReadAyah");

        console.log("Loaded settings:", {
          storedShowTafseer,
          storedLanguage,
          storedLastReadSurah,
          storedLastReadAyah,
        });

        if (storedShowTafseer !== null) {
          setShowTafseer(JSON.parse(storedShowTafseer));
        }

        if (storedLanguage !== null) {
          setLanguage(storedLanguage);
        }

        if (storedLastReadSurah !== null) {
          setLastReadSurah(parseInt(storedLastReadSurah, 10));
        }

        if (storedLastReadAyah !== null) {
          setLastReadAyah(parseInt(storedLastReadAyah, 10));
        }

        setSettingsLoaded(true);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage
  const saveSettings = useCallback(async () => {
    try {
      console.log("Saving settings:", {
        showTafseer,
        language,
        lastReadSurah,
        lastReadAyah,
      });

      await AsyncStorage.setItem("showTafseer", JSON.stringify(showTafseer));
      await AsyncStorage.setItem("language", language);
      await AsyncStorage.setItem("lastReadSurah", lastReadSurah.toString());
      await AsyncStorage.setItem("lastReadAyah", lastReadAyah.toString());
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [showTafseer, language, lastReadSurah, lastReadAyah]);

  // Save settings whenever they change
  useEffect(() => {
    if (settingsLoaded && !isLoading) {
      saveSettings();
    }
  }, [
    showTafseer,
    language,
    lastReadSurah,
    lastReadAyah,
    isLoading,
    settingsLoaded,
    saveSettings,
  ]);

  // Toggle tafseer visibility
  const toggleTafseer = useCallback(() => {
    console.log("Toggling tafseer, current value:", showTafseer);
    setShowTafseer((prev) => !prev);
  }, [showTafseer]);

  // Switch language
  const toggleLanguage = useCallback(() => {
    console.log("Toggling language, current value:", language);
    setLanguage((prev) => {
      const newLanguage = prev === "english" ? "urdu" : "english";
      console.log(`Language changed from ${prev} to ${newLanguage}`);

      // Load appropriate data file based on language
      loadQuranDataForLanguage(newLanguage);

      return newLanguage;
    });
  }, [language]);

  // Function to load Quran data based on language
  const loadQuranDataForLanguage = useCallback((lang) => {
    try {
      console.log(`Loading Quran data for language: ${lang}`);
      setIsLoading(true);

      // Load the appropriate JSON file
      const data =
        lang === "english"
          ? require("../assets/data/english.json")
          : require("../assets/data/urdu.json");

      console.log(`Loaded ${data.length} entries for ${lang}`);

      // Add missing English names for specific surahs if needed
      const enhancedData = data.map((item) => {
        // Create a copy of the item
        const enhancedItem = { ...item };

        // Fix for Surah 114 (An-Nas) - ensure it has the proper English name
        if (Number(item.SurahNumber) === 114 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "An-Nas";
        }

        // Fix for other common surahs that might be missing English names
        if (Number(item.SurahNumber) === 113 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Falaq";
        }
        if (Number(item.SurahNumber) === 112 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Ikhlas";
        }
        if (Number(item.SurahNumber) === 111 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Masad";
        }
        if (Number(item.SurahNumber) === 110 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "An-Nasr";
        }
        if (Number(item.SurahNumber) === 109 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Kafirun";
        }
        if (Number(item.SurahNumber) === 108 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Kawthar";
        }
        if (Number(item.SurahNumber) === 107 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Ma'un";
        }
        if (Number(item.SurahNumber) === 106 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Quraysh";
        }
        if (Number(item.SurahNumber) === 105 && !item.SurahNameEnglish) {
          enhancedItem.SurahNameEnglish = "Al-Fil";
        }

        return enhancedItem;
      });

      // Log sample data to see structure
      if (enhancedData.length > 0) {
        const sample =
          enhancedData.find(
            (item) =>
              Number(item.SurahNumber) === 114 && Number(item.AyahNumber) === 1
          ) || enhancedData[0];
        console.log("Sample data for Surah 114:", {
          SurahNumber: sample.SurahNumber,
          SurahName: sample.SurahName,
          SurahNameEnglish: sample.SurahNameEnglish,
          TranslationAbridged: sample.TranslationAbridged,
          Translation: sample.Translation,
          Tafseer: sample.Tafseer ? "Has tafseer" : "No tafseer",
        });
      }

      // Update the surahs state with enhanced data
      setSurahs(enhancedData);
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to load ${lang} data:`, error);
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (settingsLoaded) {
      console.log("Initial data load for language:", language);
      loadQuranDataForLanguage(language);
    }
  }, [settingsLoaded, language, loadQuranDataForLanguage]);

  // Track last read position
  const updateLastRead = useCallback((surahNumber, ayahNumber) => {
    console.log("Updating last read position:", { surahNumber, ayahNumber });
    setLastReadSurah(surahNumber);
    setLastReadAyah(ayahNumber);

    // Immediately save to AsyncStorage without waiting for effect
    AsyncStorage.setItem("lastReadSurah", surahNumber.toString())
      .then(() => AsyncStorage.setItem("lastReadAyah", ayahNumber.toString()))
      .catch((error) =>
        console.error("Failed to save last read position:", error)
      );
  }, []);

  // Create a value object with all the context values
  const contextValue = {
    showTafseer,
    language,
    surahs,
    setSurahs,
    lastReadSurah,
    lastReadAyah,
    isLoading,
    setIsLoading,
    toggleTafseer,
    toggleLanguage,
    updateLastRead,
  };

  return (
    <QuranContext.Provider value={contextValue}>
      {children}
    </QuranContext.Provider>
  );
};

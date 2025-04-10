import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuranContext } from "../context/QuranContext";

// Import JSON data directly
import englishData from "../assets/data/english.json";
import urduData from "../assets/data/urdu.json";

// This hook will handle loading and merging Surah data
const useQuranData = () => {
  const { setSurahs, setIsLoading } = useContext(QuranContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log("Loading Quran data...");

        // Use the JSON files directly
        let data;

        if (englishData && urduData) {
          // If we can import JSON files directly
          console.log("Using imported JSON files");
          console.log("English data length:", englishData.length);
          console.log("Urdu data length:", urduData.length);

          // Choose which data to use (prefer urdu if available)
          data = urduData.length > 0 ? urduData : englishData;
        } else {
          // Fallback to sample data if JSON imports fail
          console.log("JSON imports failed, using sample data");
          data = generateSampleData();
        }

        // Sort the data by SurahNumber and AyahNumber
        data = data.sort((a, b) => {
          const surahDiff = Number(a.SurahNumber) - Number(b.SurahNumber);
          if (surahDiff !== 0) return surahDiff;
          return Number(a.AyahNumber) - Number(b.AyahNumber);
        });

        console.log(`Data loaded successfully. Total entries: ${data.length}`);

        // Save data to context
        setSurahs(data);

        // Also save to AsyncStorage for future use
        await AsyncStorage.setItem("quranData", JSON.stringify(data));

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load Quran data:", err);
        setError("Failed to load Quran data. Please try again.");

        // Try to load from AsyncStorage as fallback
        try {
          const storedData = await AsyncStorage.getItem("quranData");
          if (storedData) {
            console.log("Using data from AsyncStorage as fallback");
            setSurahs(JSON.parse(storedData));
          } else {
            // Last resort - use sample data
            console.log("No stored data found, using sample data");
            setSurahs(generateSampleData());
          }
        } catch (storageErr) {
          console.error("AsyncStorage fallback also failed:", storageErr);
          setSurahs(generateSampleData());
        }

        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to generate sample data for the last 10 Surahs (kept as fallback)
  const generateSampleData = () => {
    console.log("Generating sample data");
    return [
      // Sample data remains unchanged as fallback
      {
        SurahNumber: 105,
        SurahName: "الفيل",
        SurahNameEnglish: "Al-Fil",
        AyahNumber: 1,
        AyahTextQalam: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ",
        TranslationAbridged:
          "Have you not seen how your Lord dealt with the companions of the elephant?",
        Translation:
          "کیا آپ نے نہیں دیکھا کہ آپ کے رب نے ہاتھی والوں کے ساتھ کیا کیا؟",
        Tafseer:
          "اے نبی صلی اللہ علیہ وسلم! کیا آپ نے (یعنی آپ کے علم میں) ہاتھیوں والے کا واقعہ نہیں آیا کہ اللہ نے ان کے ساتھ کیا سلوک کیا؟",
      },
      {
        SurahNumber: 105,
        SurahName: "الفيل",
        SurahNameEnglish: "Al-Fil",
        AyahNumber: 2,
        AyahTextQalam: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ",
        TranslationAbridged: "Did He not make their plan into misguidance?",
        Translation: "کیا اس نے ان کی تدبیر کو گمراہی میں نہیں ڈال دیا؟",
        Tafseer:
          "کیا اللہ تعالیٰ نے ان کی تدبیر، فریب اور مکر کو ناکام اور برباد نہیں کردیا؟",
      },
      {
        SurahNumber: 105,
        SurahName: "الفيل",
        SurahNameEnglish: "Al-Fil",
        AyahNumber: 3,
        AyahTextQalam: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ",
        TranslationAbridged: "And He sent against them birds in flocks.",
        Translation: "اور ان پر ابابیل پرندے بھیجے",
        Tafseer:
          "اور اس نے ان پر ابابیل پرندے بھیجے، یعنی پرندوں کے جھنڈ کے جھنڈ جو آتے اور ان کو چونچوں اور پنجوں میں کنکریاں لے کر آتے۔",
      },
      // Add more sample ayahs for other Surahs if needed
    ];
  };

  const loadQuranData = async () => {
    try {
      // Reset state and set loading to true
      setIsLoading(true);
      console.log("Loading Quran data for language:", language);

      // Determine which file to load based on language
      const source =
        language === "english"
          ? require("../assets/data/english.json")
          : require("../assets/data/urdu.json");

      console.log(`Successfully loaded source file for ${language}`);

      // Log some sample data to see what fields are available
      if (source && source.length > 0) {
        console.log(`Sample data (first item):`);
        console.log(
          JSON.stringify(
            {
              SurahNumber: source[0].SurahNumber,
              AyahNumber: source[0].AyahNumber,
              TranslationAbridged: source[0].TranslationAbridged,
              Translation: source[0].Translation,
              Abridged: source[0].Abridged,
            },
            null,
            2
          )
        );
      }

      // Set the surahs data in the context
      setSurahs(source);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading Quran data:", error);
      setIsLoading(false);
    }
  };

  return { error };
};

export default useQuranData;

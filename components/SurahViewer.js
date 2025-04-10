import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { QuranContext } from "../context/QuranContext";
import { useQuranData } from "../hooks/useQuranData";

const SurahViewer = () => {
  const {
    surahs,
    showTafseer,
    language,
    lastReadSurah,
    lastReadAyah,
    updateLastRead,
    isLoading,
  } = useContext(QuranContext);

  // Local state for tracking
  const [localShowTafseer, setLocalShowTafseer] = useState(showTafseer);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [
    isEndReachedCalledDuringMomentum,
    setIsEndReachedCalledDuringMomentum,
  ] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  // Track scroll events
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [pullUpActive, setPullUpActive] = useState(false);
  const lastContentHeight = useRef(0);
  const lastContentOffset = useRef(0);

  // Keep local state in sync with context
  useEffect(() => {
    console.log("SurahViewer: showTafseer changed to", showTafseer);
    setLocalShowTafseer(showTafseer);
  }, [showTafseer]);

  // Track language changes
  useEffect(() => {
    console.log("SurahViewer: language changed to", language);
    // Force re-render the FlatList when language changes
    if (viewMode === "detail" && flatListRef.current) {
      // Refresh the current view with new language
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [language, viewMode]);

  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const initialScrollComplete = useRef(false);

  // Process data to create proper Surah objects with all their Ayahs
  const filteredSurahs = React.useMemo(() => {
    console.log("Processing surahs data, length:", surahs?.length || 0);

    // Debug first few items to see structure
    if (surahs && surahs.length > 0) {
      console.log("Sample data structure:", JSON.stringify(surahs[0], null, 2));
    }

    if (!surahs || !Array.isArray(surahs) || surahs.length === 0) {
      console.log("No surahs data available");
      return [];
    }

    try {
      // Get all unique Surah numbers from 105-114
      const allSurahNumbers = surahs.map((item) => Number(item.SurahNumber));
      const uniqueSurahNumbers = [...new Set(allSurahNumbers)]
        .filter((number) => number >= 105 && number <= 114)
        .sort((a, b) => a - b);

      console.log("Unique surah numbers:", uniqueSurahNumbers);

      // Create proper Surah objects with all their Ayahs
      return uniqueSurahNumbers.map((surahNumber) => {
        // Get all ayahs for this surah (excluding bismillah at AyahNumber 0)
        const surahAyahs = surahs.filter(
          (item) =>
            Number(item.SurahNumber) === surahNumber &&
            Number(item.AyahNumber) > 0
        );

        console.log(`Surah ${surahNumber} has ${surahAyahs.length} ayahs`);

        // Get surah details from the first ayah
        const firstAyah = surahAyahs[0] || {};

        return {
          number: surahNumber,
          name: firstAyah.SurahName || "",
          englishName: firstAyah.SurahNameEnglish || "",
          urduName: firstAyah.SurahName || firstAyah.SurahNameEnglish || "", // Use Arabic name for Urdu view
          ayahs: surahAyahs.map((ayah) => ({
            number: Number(ayah.AyahNumber),
            text: ayah.AyahTextQalam || "",
            // Store all possible translation fields
            englishTranslation: ayah.TranslationAbridged || "",
            urduTranslation: ayah.Translation || "",
            tafseerUrdu: ayah.Tafseer || "",
            // Store original fields too for fallback
            TranslationAbridged: ayah.TranslationAbridged || "",
            Translation: ayah.Translation || "",
            Abridged: ayah.Abridged || "",
          })),
        };
      });
    } catch (error) {
      console.error("Error processing surahs data:", error);
      return [];
    }
  }, [surahs]);

  // Get Ayahs for the current view
  const currentAyahs = React.useMemo(() => {
    if (viewMode === "detail" && selectedSurah) {
      const surah = filteredSurahs.find((s) => s.number === selectedSurah);
      if (surah) {
        return surah.ayahs.map((ayah) => ({
          ...ayah,
          surahNumber: surah.number,
          surahName: surah.name,
          surahEnglishName: surah.englishName,
          surahUrduName: surah.urduName,
          key: `${surah.number}-${ayah.number}`,
        }));
      }
      return [];
    }

    // For list view, return empty array (we'll use filteredSurahs directly)
    return [];
  }, [filteredSurahs, selectedSurah, viewMode, language]);

  // Auto open the last read surah if one was saved
  useEffect(() => {
    if (!isLoading && lastReadSurah && !initialScrollComplete.current) {
      console.log(
        "Opening last read Surah:",
        lastReadSurah,
        "Ayah:",
        lastReadAyah
      );

      // Check if the lastReadSurah exists in our filtered list
      const surahExists = filteredSurahs.some(
        (s) => s.number === lastReadSurah
      );

      if (surahExists) {
        // Set view mode to detail and select the last read surah
        setSelectedSurah(lastReadSurah);
        setViewMode("detail");

        // Mark the initial scroll as pending - will be completed in the next effect
        initialScrollComplete.current = false;
      }
    }
  }, [isLoading, lastReadSurah, lastReadAyah, filteredSurahs]);

  // Find the index of the last read Ayah when in detail view
  useEffect(() => {
    if (
      viewMode === "detail" &&
      !isLoading &&
      currentAyahs.length > 0 &&
      selectedSurah === lastReadSurah &&
      !initialScrollComplete.current
    ) {
      console.log(
        "Attempting to scroll to last read ayah:",
        lastReadAyah,
        "in surah:",
        lastReadSurah
      );

      // Find the specific ayah in the current surah
      const lastReadAyahIndex = currentAyahs.findIndex(
        (ayah) => ayah.number === lastReadAyah
      );

      if (lastReadAyahIndex !== -1) {
        console.log("Found ayah at index:", lastReadAyahIndex);

        // Use a slightly longer delay to ensure the FlatList is fully rendered
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: lastReadAyahIndex,
              animated: true,
              viewPosition: 0,
            });
            console.log("Scrolled to ayah successfully");
          } catch (error) {
            console.log("Error scrolling to ayah:", error);
            // In case of error, try scrolling to the beginning of the surah
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }

          // Mark initial scroll as complete
          initialScrollComplete.current = true;
        }, 500);
      } else {
        console.log("Ayah not found, scrolling to beginning of surah");
        // If ayah not found, scroll to the top of the surah
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          initialScrollComplete.current = true;
        }, 300);
      }
    }
  }, [
    isLoading,
    currentAyahs,
    lastReadAyah,
    selectedSurah,
    lastReadSurah,
    viewMode,
  ]);

  // Handle pull-to-refresh to load previous Surah
  const onRefresh = React.useCallback(() => {
    if (viewMode === "detail") {
      setRefreshing(true);

      // Find previous surah number
      const surahIndex = filteredSurahs.findIndex(
        (s) => s.number === selectedSurah
      );

      // Always go to previous surah in the array, or wrap to the last one
      const previousIndex =
        surahIndex > 0 ? surahIndex - 1 : filteredSurahs.length - 1;
      const previousSurah = filteredSurahs[previousIndex]?.number;

      if (previousSurah) {
        console.log(
          `Pull-to-refresh: Moving from Surah ${selectedSurah} to Surah ${previousSurah}`
        );
        setSelectedSurah(previousSurah);
        // Update last read to the first ayah of the previous surah
        updateLastRead(previousSurah, 1);

        // Force flatList to update and scroll to the top of the new surah
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }, 100);
      }

      setRefreshing(false);
    }
  }, [selectedSurah, filteredSurahs, viewMode, updateLastRead]);

  // Called when user views an Ayah - update last read position
  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }) => {
      if (viewMode === "detail" && viewableItems.length > 0) {
        const firstVisibleItem = viewableItems[0];
        const surahNumber = firstVisibleItem.item.surahNumber;
        const ayahNumber = firstVisibleItem.item.number;

        console.log("Updating last read position:", surahNumber, ayahNumber);
        updateLastRead(surahNumber, ayahNumber);
      }
    },
    [updateLastRead, viewMode]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const handleScrollToIndexFailed = (info) => {
    console.log("Scroll to index failed:", info);
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    }, 100);
  };

  // Handle surah selection
  const handleSurahPress = (surahNumber) => {
    console.log("Selecting Surah:", surahNumber);
    // Add a small delay to prevent accidental double-selection
    setTimeout(() => {
      setSelectedSurah(surahNumber);
      setViewMode("detail");
      updateLastRead(surahNumber, 1);
    }, 50);
  };

  // Go back to surah list
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSurah(null);
  };

  // Handle end reached - Load next Surah when scrolling to the end
  const handleEndReached = () => {
    // For small Surahs, completely disable automatic navigation
    const surah = filteredSurahs.find((s) => s.number === selectedSurah);
    if (surah && surah.ayahs.length <= 3) {
      console.log("Small Surah detected, disabling auto-navigation");
      return;
    }

    // Prevent multiple calls during momentum scroll
    if (isEndReachedCalledDuringMomentum) return;

    // Add cooldown to prevent rapid firing (throttle to 2 seconds for better control)
    const now = Date.now();
    if (now - lastLoadTime < 2000) return;

    if (viewMode === "detail") {
      // Find next surah number
      const surahIndex = filteredSurahs.findIndex(
        (s) => s.number === selectedSurah
      );

      // Always go to next surah in the array, or wrap to the first one (circular)
      const nextIndex =
        surahIndex < filteredSurahs.length - 1 ? surahIndex + 1 : 0;
      const nextSurah = filteredSurahs[nextIndex]?.number;

      if (nextSurah) {
        console.log(
          `End reached: Moving from Surah ${selectedSurah} to Surah ${nextSurah}`
        );

        // Update timestamp for rate limiting
        setLastLoadTime(now);
        setIsEndReachedCalledDuringMomentum(true);

        // First update state
        setSelectedSurah(nextSurah);

        // Then update last read position
        updateLastRead(nextSurah, 1);
      }
    }
  };

  // Track scroll events
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentOffset = contentOffset.y;
    setScrollPosition(currentOffset);

    // Calculate if user is at the end of the content
    const distanceFromEnd =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    const isNearEnd = distanceFromEnd < 40; // within 40px of the end

    // Save content height for reference
    lastContentHeight.current = contentSize.height;

    // Detect if user is pulling up at the end (similar to pull-to-refresh logic but at bottom)
    if (isNearEnd) {
      setIsAtEnd(true);

      // If user is pulling up (offset decreases while at end)
      if (currentOffset < lastContentOffset.current && currentOffset > 0) {
        setPullUpActive(true);
      } else if (currentOffset > lastContentOffset.current + 10) {
        // Reset if scrolling down significantly
        setPullUpActive(false);
      }
    } else {
      setIsAtEnd(false);
      setPullUpActive(false);
    }

    // Store last offset for next comparison
    lastContentOffset.current = currentOffset;
  };

  // Function to load next Surah (called manually on pull-up)
  const loadNextSurah = React.useCallback(() => {
    const now = Date.now();
    if (now - lastLoadTime < 1000) return; // Throttle

    // Find next surah number
    const surahIndex = filteredSurahs.findIndex(
      (s) => s.number === selectedSurah
    );

    // Always go to next surah in the array, or wrap to the first one (circular)
    const nextIndex =
      surahIndex < filteredSurahs.length - 1 ? surahIndex + 1 : 0;
    const nextSurah = filteredSurahs[nextIndex]?.number;

    if (nextSurah) {
      console.log(
        `Pull-up: Moving from Surah ${selectedSurah} to Surah ${nextSurah}`
      );

      // Update timestamp for rate limiting
      setLastLoadTime(now);
      setSelectedSurah(nextSurah);
      updateLastRead(nextSurah, 1);
      setPullUpActive(false);
    }
  }, [selectedSurah, filteredSurahs, updateLastRead, lastLoadTime]);

  // Check if we should navigate based on pull-up state
  useEffect(() => {
    if (pullUpActive && isAtEnd && viewMode === "detail") {
      loadNextSurah();
    }
  }, [pullUpActive, isAtEnd, loadNextSurah, viewMode]);

  // Reset momentum flag when scroll momentum ends
  const handleMomentumScrollEnd = () => {
    setIsEndReachedCalledDuringMomentum(false);

    // Reset pull-up state when scrolling stops
    setPullUpActive(false);
  };

  // When selectedSurah changes, scroll to top
  useEffect(() => {
    if (viewMode === "detail" && selectedSurah && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }, 200);
    }
  }, [selectedSurah, viewMode]);

  // Render footer for detail view - shows loading indicator when pulling up
  const renderFooter = () => {
    if (!isAtEnd || viewMode !== "detail") return null;

    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {pullUpActive
            ? "Release to load next Surah..."
            : "Pull up to load next Surah..."}
        </Text>
      </View>
    );
  };

  // Render function for Surah list item
  const renderSurahItem = ({ item }) => (
    <TouchableOpacity
      style={styles.surahListItem}
      onPress={() => handleSurahPress(item.number)}>
      <View style={styles.surahNumberBadge}>
        <Text style={styles.surahNumberText}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahTitle}>
          {language === "english"
            ? item.englishName || `Surah ${item.number}`
            : item.urduName || item.name || `Surah ${item.number}`}
        </Text>
        <Text style={styles.surahMeta}>{item.ayahs.length} Ayahs</Text>
      </View>
      <View style={styles.surahArrow}>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );

  // Render function for Ayah item in detail view
  const renderAyahItem = ({ item }) => {
    // Get the correct translation based on language
    const translationText =
      language === "english"
        ? item.TranslationAbridged ||
          item.englishTranslation ||
          item.Translation ||
          "No English translation available"
        : item.urduTranslation ||
          item.Translation ||
          "No Urdu translation available";

    // Determine if tafseer exists and should be shown
    const tafseerText = item.tafseerUrdu || "";
    const hasTafseer = tafseerText.trim().length > 0;
    const showTafseerForThisItem = localShowTafseer && hasTafseer;

    // Add tafseer for Surah 114 if missing
    let displayedTafseerText = tafseerText;
    if (item.surahNumber === 114 && !hasTafseer) {
      if (item.number === 1) {
        displayedTafseerText =
          "Surah An-Nas (The Mankind) - This surah is a prayer seeking protection from the evil whisperings of Satan.";
      } else if (item.number === 2) {
        displayedTafseerText =
          "Allah is described as the King of mankind, emphasizing His sovereignty and power over all human affairs.";
      } else if (item.number === 3) {
        displayedTafseerText =
          "Allah is described as the God of mankind, emphasizing that He alone deserves to be worshipped.";
      } else if (item.number === 4) {
        displayedTafseerText =
          "Seeking protection from the evil of the whisperer who withdraws when Allah is remembered.";
      } else if (item.number === 5) {
        displayedTafseerText =
          "The whisperer (Satan) whispers evil thoughts into the hearts of mankind.";
      } else if (item.number === 6) {
        displayedTafseerText =
          "These whispers come from both jinn and men, indicating that evil suggestions can come from both supernatural and human sources.";
      }
    }

    console.log(
      `Rendering ayah ${item.number} with language: ${language}, surah: ${item.surahNumber}`
    );
    console.log(`Has tafseer: ${hasTafseer ? "Yes" : "No (using fallback)"}`);

    return (
      <View style={styles.ayahContainer}>
        <View style={styles.ayahTextContainer}>
          <Text style={styles.arabicText}>{item.text}</Text>

          <Text style={styles.translationText}>{translationText}</Text>

          {localShowTafseer && displayedTafseerText.trim().length > 0 && (
            <Text style={styles.tafseerText}>{displayedTafseerText}</Text>
          )}

          <Text style={styles.ayahNumber}>{item.number}</Text>
        </View>
      </View>
    );
  };

  // Render surah header for detail view
  const renderSurahHeader = () => {
    if (!selectedSurah) return null;

    const surah = filteredSurahs.find((s) => s.number === selectedSurah);
    if (!surah) return null;

    return (
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.surahHeader}>
          <Text style={styles.surahName}>
            {surah.number}.{" "}
            {language === "english"
              ? surah.englishName || `Surah ${surah.number}`
              : surah.urduName || surah.name || `Surah ${surah.number}`}
          </Text>
          <Text style={styles.surahAyahCount}>{surah.ayahs.length} Ayahs</Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading Surahs...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredSurahs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Surahs found</Text>
      </View>
    );
  }

  if (viewMode === "list") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.languageIndicator}>
          <Text style={styles.languageIndicatorText}>
            {language === "english" ? "English" : "Urdu"}
          </Text>
        </View>
        <FlatList
          ref={flatListRef}
          data={filteredSurahs}
          keyExtractor={(item) => `surah-${item.number}`}
          contentContainerStyle={styles.flatListContent}
          renderItem={renderSurahItem}
          onScrollToIndexFailed={handleScrollToIndexFailed}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderSurahHeader()}
      <FlatList
        key={`surah-${selectedSurah}-${
          localShowTafseer ? "with" : "without"
        }-tafseer-${language}`}
        ref={flatListRef}
        data={currentAyahs}
        renderItem={renderAyahItem}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6200ee"]}
          />
        }
        // Disable automatic end reached for more control
        onEndReached={null}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={[
          styles.flatListContent,
          // Add extra padding for small lists to ensure they fill the screen
          currentAyahs.length <= 3 && {
            paddingBottom: 800,
            minHeight: 1000,
          },
        ]}
        extraData={[localShowTafseer, pullUpActive, selectedSurah, language]}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        maxToRenderPerBatch={10}
        windowSize={10}
        scrollEventThrottle={16}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flatListContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Surah List Styles
  surahListItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  surahNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6200ee22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  surahInfo: {
    flex: 1,
  },
  surahTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 14,
    color: "#666",
  },
  surahArrow: {
    width: 24,
  },
  arrowIcon: {
    fontSize: 24,
    color: "#6200ee",
  },
  // Detail View Styles
  detailHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButtonText: {
    color: "#6200ee",
    fontSize: 16,
    fontWeight: "bold",
  },
  surahHeader: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: "#6200ee",
    borderRadius: 8,
    alignItems: "center",
  },
  surahName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  surahAyahCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  ayahContainer: {
    marginBottom: 16,
  },
  ayahTextContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: "right",
    marginBottom: 16,
    fontWeight: "500",
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tafseerText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    color: "#555",
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 4,
  },
  ayahNumber: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#f0f0f0",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
  },
  footerContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  footerText: {
    color: "#6200ee",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
  languageIndicator: {
    padding: 16,
    backgroundColor: "#6200ee",
    borderRadius: 8,
    marginBottom: 16,
  },
  languageIndicatorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default SurahViewer;

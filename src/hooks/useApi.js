import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook for making API calls
 */
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Create a cache key based on the URL
        const cacheKey = `api_cache_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Try to get data from AsyncStorage first
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          // Use cached data if available
          setData(JSON.parse(cachedData));
          setError(null);
          setLoading(false);
          return;
        }
        
        // If no cached data, fetch from API
        const response = await axios.get(url);
        setData(response.data);
        
        // Store the fetched data in AsyncStorage
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        
        setError(null);
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useApi; 
import React, { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      try {
        return JSON.parse(item);
      } catch {
        // If it was stored as a raw string instead of serialized JSON
        if (item === 'light' || item === 'dark' || item === 'system') {
          return item as unknown as T;
        }
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };
  
  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
    // This effect should re-run whenever the key changes (e.g., user logs in/out)
  }, [key]);

  return [storedValue, setValue];
}
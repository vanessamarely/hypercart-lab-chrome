import { useCallback, useEffect, useRef, useState } from 'react';

type SetValue<T> = T | ((current: T) => T);

function isBrowser() {
  return typeof window !== 'undefined';
}

export function useKV<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void] {
  const initialValueRef = useRef(initialValue);

  const readValue = useCallback((): T => {
    if (!isBrowser()) {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  }, [key]);

  const [value, setValue] = useState<T>(() => readValue());

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Gracefully ignore storage write failures.
    }
  }, [key, value]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }

      setValue(readValue());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, readValue]);

  const setStoredValue = useCallback((nextValue: SetValue<T>) => {
    setValue((currentValue) => {
      return typeof nextValue === 'function'
        ? (nextValue as (current: T) => T)(currentValue)
        : nextValue;
    });
  }, []);

  return [value, setStoredValue];
}

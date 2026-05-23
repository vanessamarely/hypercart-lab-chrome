import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((current: T) => T);

function isBrowser() {
  return typeof window !== 'undefined';
}

export function useKV<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void] {
  const readValue = useCallback((): T => {
    if (!isBrowser()) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue, key]);

  const [value, setValue] = useState<T>(() => readValue());

  useEffect(() => {
    setValue(readValue());
  }, [readValue]);

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
      const resolvedValue =
        typeof nextValue === 'function'
          ? (nextValue as (current: T) => T)(currentValue)
          : nextValue;

      if (isBrowser()) {
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          // Gracefully ignore storage write failures.
        }
      }

      return resolvedValue;
    });
  }, [key]);

  return [value, setStoredValue];
}

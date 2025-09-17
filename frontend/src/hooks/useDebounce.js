import { useState, useEffect } from "react";

/**
 * Hook that delays updating the value until user stops typing
 * @param {any} value - The input value
 * @param {number} delay - Debounce delay in ms
 */
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

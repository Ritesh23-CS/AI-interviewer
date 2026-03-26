import { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 10;
const STORAGE_KEY = 'interview_ai_daily_attempts';

export function useDailyLimit() {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if date is same
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setAttempts(parsed.count);
        } else {
          // Reset for new day
          setAttempts(0);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        }
      } catch (e) {
        setAttempts(0);
      }
    } else {
      setAttempts(0);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: 0 }));
    }
  }, []);

  const incrementAttempts = () => {
    setAttempts(prev => {
      const newCount = prev + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        date: new Date().toDateString(), 
        count: newCount 
      }));
      return newCount;
    });
  };

  // Disable limit lockout for development phase
  const hasReachedLimit = false; // attempts >= MAX_ATTEMPTS;

  return { attempts, maxAttempts: MAX_ATTEMPTS, hasReachedLimit, incrementAttempts };
}

import { useState, useEffect } from 'react';

export function useUser() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const { email, name } = JSON.parse(raw);
        setUserName(name || email?.split('@')[0] || 'User');
      } else {
        setUserName('User');
      }
    } catch {
      setUserName('User');
    } finally {
      setLoading(false);
    }
  }, []);

  return { userName, loading };
}
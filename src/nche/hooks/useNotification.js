import { useState, useCallback, useRef } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const push = useCallback((type, message, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    setVisible(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => setNotification(null), 300);
    }, duration);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setNotification(null), 300);
  }, []);

  return {
    notification,
    visible,
    dismiss,
    success: (msg) => push('success', msg, 3000),
    error:   (msg) => push('error', msg, 4000),
    info:    (msg) => push('info', msg, 3000),
  };
}
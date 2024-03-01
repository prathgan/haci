import React, { useEffect } from 'react';

function useKeyboardShortcut(key, callback) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === key) {
        callback(event);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [key, callback]);
}

export default useKeyboardShortcut;

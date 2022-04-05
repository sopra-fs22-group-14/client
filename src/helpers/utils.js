import React, {useRef, useEffect} from 'react';

// custom hook to implement polling
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up interval
  useEffect(() => {
    function tick() {
      savedCallback.current(); // execute the callback
    }
    if (delay != null) {
      const id = setInterval(tick, delay);   // set up interval
      return () => clearInterval(id);   // unmount
    }
  }, [callback, delay])
}
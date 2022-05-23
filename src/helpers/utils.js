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

// function to combine the black and white cards text (for TTS)
export const createText = (black, white) => {

  let combination;

  if (black.includes('_')) {
    let index = black.indexOf('_');
    // if the white card ends with a ".", but the black card doens't want a dot there -> remove it
    if (white.endsWith('.') && black.slice(index + 1).length > 1)
      white = white.slice(0, -1);
    combination = black.slice(0, index) + white + black.slice(index + 1);
  } else {
    combination = black + " " + white;
  }
  combination = combination.replaceAll('..', '.');
  combination = combination.replaceAll('.!', '!');
  combination = combination.replaceAll('.?', '?');
  return combination;
}

// function to get a random integer
export const pickRandom = (upperBound) => {
  return Math.floor(Math.random() * upperBound);
}
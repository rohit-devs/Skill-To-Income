// ----------------------------------------------------------------------
// File: client/src/hooks/useCountUp.js
// Purpose: Reusable React custom hook to perform smooth count-up animations.
// Author: Principal Software Architect
// Dependencies: react
// Used By: HomePage.js
// Features: Easing (easeOutCubic), customizable duration, start trigger.
// Responsibilities: Increment numerical values from 0 to target over a specified duration.
// ----------------------------------------------------------------------

import { useState, useEffect } from 'react';

/**
 * Perform a smooth count-up animation to a target number.
 *
 * Purpose:
 * Smoothly increments a value to target.
 *
 * Parameters:
 * @param {number} target - The target number to count up to.
 * @param {number} [duration=1800] - Duration of count-up in milliseconds.
 * @param {boolean} [start=false] - Whether to begin counting.
 *
 * Returns:
 * @returns {number} The current count-up value.
 *
 * Used By:
 * HomePage.js
 */
export default function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return value;
}

"use client";

import { useState, useEffect } from "react";

/**
 * Hook that animates a number from 0 to the target value
 * @param target - The final number to count to
 * @param duration - Animation duration in milliseconds (default 1000ms)
 * @param enabled - Whether to start the animation
 */
export function useAnimatedCounter(
    target: number,
    duration: number = 1000,
    enabled: boolean = true
): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!enabled || target === 0) {
            setCount(target);
            return;
        }

        // Reset to 0 when target changes
        setCount(0);

        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function: easeOutQuart for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(startValue + (target - startValue) * eased);
            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target); // Ensure we end exactly on target
            }
        };

        requestAnimationFrame(animate);
    }, [target, duration, enabled]);

    return count;
}

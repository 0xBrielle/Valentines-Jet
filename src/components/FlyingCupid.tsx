"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import b1 from "../assets/images/b1.png";
import b2 from "../assets/images/b2.png";

interface FlyingCupidProps {
    delay?: number;
}

export default function FlyingCupid({ delay = 0 }: FlyingCupidProps) {
    const [currentFrame, setCurrentFrame] = useState(b1);
    const [direction, setDirection] = useState(1); // 1 for right, -1 for left
    const controls = useAnimation();

    // Flapping wings animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev === b1 ? b2 : b1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const startFlight = useCallback(async () => {
        // Initial staggered delay
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        while (true) {
            const startY = Math.random() * 80 + 10; // 10vh to 90vh
            const endY = Math.random() * 80 + 10;
            // Lessened speed by 70% (duration is ~3.3x longer than 3-5s)
            const duration = Math.random() * 10 + 25; // 25-35 seconds (was 10-15s)

            // Randomly start from left or right
            const startFromLeft = Math.random() > 0.5;
            setDirection(startFromLeft ? 1 : -1);

            // Animate from off-screen left to off-screen right (or vice versa)
            await controls.start({
                x: startFromLeft ? ["-50vw", "150vw"] : ["150vw", "-50vw"],
                y: [`${startY}vh`, `${endY}vh`],
                transition: { duration, ease: "linear" },
            });
        }
    }, [controls, delay]);

    useEffect(() => {
        startFlight();
    }, [startFlight]);

    return (
        <motion.div
            animate={controls}
            className="fixed pointer-events-none z-[50] w-24 md:w-40 h-auto"
            style={{ top: 0, left: 0 }}
            initial={{ x: "-50vw", y: "0vh" }}
        >
            <div style={{ transform: `scaleX(${direction})` }}>
                <Image
                    src={currentFrame}
                    alt="Flying Cupid"
                    className="w-full h-auto drop-shadow-xl opacity-90"
                    priority
                />
            </div>
        </motion.div>
    );
}

"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import b1 from "../assets/images/b1.png";
import b2 from "../assets/images/b2.png";

export default function FlyingCupid() {
    const [currentFrame, setCurrentFrame] = useState(b1);
    const [direction, setDirection] = useState(1); // 1 for right, -1 for left
    const controls = useAnimation();

    // Flapping wings animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev === b1 ? b2 : b1));
        }, 100); // Faster flapping
        return () => clearInterval(interval);
    }, []);

    // Flying movement
    useEffect(() => {
        const fly = async () => {
            while (true) {
                const startY = Math.random() * 80 + 10;
                const endY = Math.random() * 80 + 10;
                const duration = Math.random() * 2 + 2; // 2-4 seconds (5x faster)
                const startScale = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
                const endScale = Math.random() * 0.5 + 0.5;

                // Randomly start from left or right
                const startFromLeft = Math.random() > 0.5;
                setDirection(startFromLeft ? 1 : -1);

                await controls.start({
                    x: startFromLeft ? ["-30%", "130%"] : ["130%", "-30%"],
                    y: [`${startY}%`, `${endY}%`],
                    scale: [startScale, (startScale + endScale) * 1.5 / 2, endScale],
                    transition: { duration, ease: "easeInOut" },
                });
            }
        };
        fly();
    }, [controls]);

    return (
        <motion.div
            animate={controls}
            className="fixed pointer-events-none z-20 w-32 md:w-48 h-auto"
            style={{ top: 0, left: 0 }}
            initial={{ x: "-20%", y: "20%" }}
        >
            <div style={{ transform: `scaleX(${direction})` }}>
                <Image
                    src={currentFrame}
                    alt="Flying Cupid"
                    className="w-full h-auto drop-shadow-xl"
                    priority
                />
            </div>
        </motion.div>
    );
}

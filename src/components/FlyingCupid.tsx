"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
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

    // Flying movement
    useEffect(() => {
        const fly = async () => {
            // Initial delay to stagger multiple cupids
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }

            while (true) {
                const startY = Math.random() * 80 + 10;
                const endY = Math.random() * 80 + 10;
                const duration = Math.random() * 2 + 3; // 3-5 seconds

                // Randomly start from left or right
                const startFromLeft = Math.random() > 0.5;
                setDirection(startFromLeft ? 1 : -1);

                // Ensure it flies across the entire viewport width
                await controls.start({
                    x: startFromLeft ? ["-50vw", "150vw"] : ["150vw", "-50vw"],
                    y: [`${startY}vh`, `${endY}vh`],
                    transition: { duration, ease: "linear" },
                });
            }
        };
        fly();
    }, [controls, delay]);

    return (
        <motion.div
            animate={controls}
            className="fixed pointer-events-none z-20 w-32 md:w-48 h-auto"
            style={{ top: 0, left: 0 }}
            initial={{ x: "-50vw", y: "20vh" }}
        >
            <div style={{ transform: `scaleX(${direction})` }}>
                <Image
                    src={currentFrame}
                    alt="Flying Cupid"
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                />
            </div>
        </motion.div>
    );
}

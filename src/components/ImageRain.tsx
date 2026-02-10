"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import c1 from "../assets/images/c1.png";
import c2 from "../assets/images/c2.png";
import c3 from "../assets/images/c3.png";
import c4 from "../assets/images/c4.png";

const IMAGES = [c1, c2, c3, c4];

interface RainItem {
    id: number;
    x: number;
    image: any;
    duration: number;
    delay: number;
    size: number;
    bouncing?: boolean;
}

interface ImageRainProps {
    triggerCount: number;
    isSuccess?: boolean;
}

export default function ImageRain({ triggerCount, isSuccess }: ImageRainProps) {
    const [items, setItems] = useState<RainItem[]>([]);

    const spawnItems = useCallback((count: number, image: any, bouncing: boolean = false) => {
        const newItems: RainItem[] = Array.from({ length: count }).map((_, i) => ({
            id: Date.now() + Math.random() + i,
            x: Math.random() * 100,
            image: image,
            duration: Math.random() * 3 + 2, // 2-5 seconds
            delay: Math.random() * (bouncing ? 5 : 2), // Longer staggering for success
            size: Math.random() * 120 + 60, // 60-180px
            bouncing: bouncing
        }));

        setItems((prev) => [...prev, ...newItems]);

        // Clean up
        setTimeout(() => {
            setItems((prev) => prev.filter((item) => !newItems.includes(item)));
        }, 10000);
    }, []);

    // Handle "No" clicks
    useEffect(() => {
        if (triggerCount > 0 && !isSuccess) {
            const imageIndex = (triggerCount - 1) % IMAGES.length;
            spawnItems(50, IMAGES[imageIndex]);
        }
    }, [triggerCount, isSuccess, spawnItems]);

    // Handle "Yes" (Success)
    useEffect(() => {
        if (isSuccess) {
            // Spawn 250 c2.png images (5x the usual 50)
            spawnItems(250, c2, true);
        }
    }, [isSuccess, spawnItems]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden">
            <AnimatePresence>
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ y: -200, x: `${item.x}vw`, opacity: 0, rotate: 0 }}
                        animate={{
                            y: "110vh",
                            opacity: [0, 1, 1, 0],
                            rotate: item.bouncing ? [0, 90, 180, 270, 360] : 180,
                            // Add slight horizontal "swaying/bouncing" for success items
                            x: item.bouncing
                                ? [`${item.x}vw`, `${item.x + 5}vw`, `${item.x - 5}vw`, `${item.x}vw`]
                                : `${item.x}vw`
                        }}
                        transition={{
                            y: {
                                duration: item.duration,
                                delay: item.delay,
                                ease: item.bouncing ? "easeOut" : "linear"
                            },
                            opacity: { duration: item.duration, delay: item.delay },
                            rotate: { duration: item.duration, delay: item.delay },
                            x: {
                                repeat: item.bouncing ? Infinity : 0,
                                duration: 1,
                                ease: "easeInOut",
                                repeatType: "reverse"
                            }
                        }}
                        style={{ position: "absolute", width: item.size, height: "auto" }}
                    >
                        <Image
                            src={item.image}
                            alt="raining image"
                            width={item.size}
                            height={item.size}
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

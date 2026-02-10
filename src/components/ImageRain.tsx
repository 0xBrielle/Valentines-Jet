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
}

export default function ImageRain({ triggerCount }: { triggerCount: number }) {
    const [items, setItems] = useState<RainItem[]>([]);

    const spawnRain = useCallback(() => {
        const imageIndex = (triggerCount - 1) % IMAGES.length;
        const selectedImage = IMAGES[imageIndex];

        const newItems: RainItem[] = Array.from({ length: 50 }).map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100, // 0 to 100vw
            image: selectedImage,
            duration: Math.random() * 2 + 1, // 1-3 seconds
            delay: Math.random() * 2, // 0-2 seconds delay
            size: Math.random() * 40 + 20, // 20-60px
        }));

        setItems((prev) => [...prev, ...newItems]);

        // Clean up old items after they fall
        setTimeout(() => {
            setItems((prev) => prev.filter((item) => !newItems.includes(item)));
        }, 5000);
    }, [triggerCount]);

    useEffect(() => {
        if (triggerCount > 0) {
            spawnRain();
        }
    }, [triggerCount, spawnRain]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden">
            <AnimatePresence>
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ y: -100, x: `${item.x}vw`, opacity: 0, rotate: 0 }}
                        animate={{
                            y: "110vh",
                            opacity: [0, 1, 1, 0],
                            rotate: 360
                        }}
                        transition={{
                            duration: item.duration,
                            delay: item.delay,
                            ease: "linear"
                        }}
                        style={{ position: "absolute", width: item.size, height: "auto" }}
                    >
                        <Image
                            src={item.image}
                            alt="raining image"
                            width={item.size}
                            height={item.size}
                            className="w-full h-auto drop-shadow-md"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

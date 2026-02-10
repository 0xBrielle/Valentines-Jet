"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Import images with their correct extensions
import baguio1 from "../assets/images/baguioplace1.jpeg";
import baguio2 from "../assets/images/baguioplace2.avif";
import baguio3 from "../assets/images/baguioplace3.jpeg";
import baguio4 from "../assets/images/baguioplace4.jpg";
import baguio5 from "../assets/images/baguioplace5.jpg";
import baguio6 from "../assets/images/baguioplace6.jpg";
import baguio7 from "../assets/images/baguioplace7.jpg";
import baguio8 from "../assets/images/baguioplace8.webp";
import baguio9 from "../assets/images/baguioplace9.webp";
import baguio10 from "../assets/images/baguioplace10.png";

const ALL_IMAGES = [
    baguio1, baguio2, baguio3, baguio4, baguio5,
    baguio6, baguio7, baguio8, baguio9, baguio10
];

export default function BackgroundImageGrid() {
    // Initialize with first 5 unique images
    const [currentImages, setCurrentImages] = useState(ALL_IMAGES.slice(0, 5));
    const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

    const handleInteraction = (index: number) => {
        if (flippingIndex !== null) return;

        setFlippingIndex(index);

        setTimeout(() => {
            setCurrentImages(prev => {
                const next = [...prev];
                // Images currently showing that are NOT at the index we are flipping
                const currentShowingSet = new Set(prev.filter((_, i) => i !== index));

                // Available images from the full pool of 10 that are not currently showing anywhere else
                const availablePool = ALL_IMAGES.filter(img => !currentShowingSet.has(img) && img !== prev[index]);

                if (availablePool.length > 0) {
                    const randomImg = availablePool[Math.floor(Math.random() * availablePool.length)];
                    next[index] = randomImg;
                }
                return next;
            });
        }, 300);

        setTimeout(() => {
            setFlippingIndex(null);
        }, 600);
    };

    return (
        <div className="fixed inset-0 grid grid-cols-5 grid-rows-1 w-full h-screen opacity-80 z-0 overflow-hidden bg-background pointer-events-none">
            {currentImages.map((img, idx) => (
                <div
                    key={idx}
                    className="relative w-full h-full p-1 pointer-events-auto" // Added pointer-events-auto here
                    onClick={() => handleInteraction(idx)}
                >
                    <motion.div
                        className="w-full h-full relative preserve-3d cursor-pointer"
                        animate={{ rotateY: flippingIndex === idx ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Front face */}
                        <div className="absolute inset-0 w-full h-full backface-hidden border-[6px] border-white shadow-xl overflow-hidden rounded-sm">
                            <Image
                                src={img}
                                alt={`Baguio Place ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="20vw"
                                priority
                            />
                        </div>

                        {/* Back face */}
                        <div
                            className="absolute inset-0 w-full h-full backface-hidden border-[6px] border-white shadow-xl overflow-hidden rounded-sm"
                            style={{ transform: "rotateY(180deg)" }}
                        >
                            <Image
                                src={img}
                                alt={`Baguio Place ${idx + 1} Back`}
                                fill
                                className="object-cover"
                                sizes="20vw"
                            />
                        </div>
                    </motion.div>
                </div>
            ))}
            <style jsx global>{`
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
            `}</style>
        </div>
    );
}

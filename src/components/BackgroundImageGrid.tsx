"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Import images
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

// Correcting potential import names based on list_dir earlier
// baguioplace1.jpeg, baguioplace10.png, baguioplace2.avif, baguioplace3.jpeg, baguioplace4.jpg, 
// baguioplace5.jpg, baguioplace6.jpg, baguioplace7.jpg, baguioplace8.webp, baguioplace9.webp
const PLACES = [
    baguio1, baguio2, baguio3, baguio4, baguio5,
    baguio6, baguio7, baguio8, baguio9, baguio10
];

export default function BackgroundImageGrid() {
    // Show exactly 8 unique images from our pool of 10
    const initialImages = useMemo(() => {
        return [...PLACES].sort(() => Math.random() - 0.5).slice(0, 8);
    }, []);

    const [currentImages, setCurrentImages] = useState(initialImages);
    const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

    const handleInteraction = (index: number) => {
        if (flippingIndex !== null) return;
        setFlippingIndex(index);

        setTimeout(() => {
            setCurrentImages(prev => {
                const next = [...prev];
                // Images currently showing everywhere else
                const currentlyShowing = new Set(prev);

                // Available images from the 10 that are NOT currently showing
                const availablePool = PLACES.filter(img => !currentlyShowing.has(img));

                if (availablePool.length > 0) {
                    // Pick one from the 2 "hidden" images
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
        <div className="fixed inset-0 w-full h-screen p-0.5 z-0 opacity-80 bg-background pointer-events-none overflow-hidden">
            {/* 2x4 on mobile, 4x2 on desktop - fills screen, 0 duplicates */}
            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-0.5 w-full h-full">
                {currentImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative pointer-events-auto h-full w-full"
                        onClick={() => handleInteraction(idx)}
                    >
                        <motion.div
                            className="relative w-full h-full preserve-3d cursor-pointer"
                            animate={{ rotateY: flippingIndex === idx ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className="absolute inset-0 w-full h-full backface-hidden border border-white/40 shadow-sm overflow-hidden">
                                <Image
                                    src={img}
                                    alt={`Collage Item ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    priority={idx < 4}
                                />
                            </div>

                            <div
                                className="absolute inset-0 w-full h-full backface-hidden border border-white/40 shadow-sm overflow-hidden"
                                style={{ transform: "rotateY(180deg)" }}
                            >
                                <Image
                                    src={img}
                                    alt={`Collage Item ${idx + 1} Back`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
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

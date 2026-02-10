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
    // We want 15 slots. Let's initialize them by repeating some images.
    const initialImages = useMemo(() => {
        const arr = [...PLACES];
        while (arr.length < 15) {
            arr.push(PLACES[Math.floor(Math.random() * PLACES.length)]);
        }
        return arr;
    }, []);

    const [currentImages, setCurrentImages] = useState(initialImages);
    const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

    const handleInteraction = (index: number) => {
        if (flippingIndex !== null) return;
        setFlippingIndex(index);

        setTimeout(() => {
            setCurrentImages(prev => {
                const next = [...prev];
                // Select a random image from the pool of 10 that isn't the same as the current one
                let randomImg;
                do {
                    randomImg = PLACES[Math.floor(Math.random() * PLACES.length)];
                } while (randomImg === prev[index] && PLACES.length > 1);

                next[index] = randomImg;
                return next;
            });
        }, 300);

        setTimeout(() => {
            setFlippingIndex(null);
        }, 600);
    };

    return (
        <div className="fixed inset-0 w-full h-full p-2 overflow-y-auto z-0 opacity-80 bg-background pointer-events-none">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2 w-full">
                {currentImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="mb-2 break-inside-avoid pointer-events-auto"
                        onClick={() => handleInteraction(idx)}
                    >
                        <motion.div
                            className="relative w-full preserve-3d cursor-pointer"
                            animate={{ rotateY: flippingIndex === idx ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Front face */}
                            <div className="relative w-full backface-hidden border-4 border-white shadow-lg rounded-sm overflow-hidden">
                                <Image
                                    src={img}
                                    alt={`Collage Item ${idx + 1}`}
                                    width={500}
                                    height={500}
                                    className="w-full h-auto object-cover"
                                    priority={idx < 4}
                                />
                            </div>

                            {/* Back face (will show the same image until the state update mid-flip) */}
                            <div
                                className="absolute inset-0 w-full h-full backface-hidden border-4 border-white shadow-lg rounded-sm overflow-hidden"
                                style={{ transform: "rotateY(180deg)" }}
                            >
                                <Image
                                    src={img}
                                    alt={`Collage Item ${idx + 1} Back`}
                                    fill
                                    className="object-cover"
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

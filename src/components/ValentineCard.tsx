"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart } from "lucide-react";
import Link from "next/link";

import ImageRain from "./ImageRain";

export default function ValentineCard() {
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [isAccepted, setIsAccepted] = useState(false);
    const [scale, setScale] = useState(1);
    const [rainTrigger, setRainTrigger] = useState(0);

    const handleNoMove = () => {
        // Thousands of images rain down (handled by rainTrigger increase)
        setRainTrigger(prev => prev + 1);

        // Move "No" button randomly in the page (viewport)
        // We use window dimensions to ensure it's truly random across the page
        const padding = 100;
        const newX = (Math.random() - 0.5) * (window.innerWidth - padding);
        const newY = (Math.random() - 0.5) * (window.innerHeight - padding);

        setNoPosition({ x: newX, y: newY });
        setScale((prev) => prev + 0.1);
    };

    const handleYes = () => {
        setIsAccepted(true);
    };

    return (
        <>
            <ImageRain triggerCount={rainTrigger} isSuccess={isAccepted} />
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <AnimatePresence mode="wait">
                    {!isAccepted ? (
                        <motion.div
                            key="ask"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="p-8 md:p-12 rounded-3xl bg-glass backdrop-blur-md border border-glass-border shadow-2xl text-center max-w-lg w-full pointer-events-auto"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="inline-block mb-6 text-primary"
                            >
                                <Heart size={64} fill="currentColor" />
                            </motion.div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground leading-tight px-4">
                                Can I steal you away for a little love adventure? ❤️
                            </h1>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ scale }}
                                    onClick={handleYes}
                                    className="px-10 py-4 rounded-full bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary-hover transition-colors"
                                >
                                    Yes! ✨
                                </motion.button>

                                <Link href="/game">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="px-8 py-4 rounded-full bg-accent text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                                    >
                                        Play a Game 🎮
                                    </motion.button>
                                </Link>

                                <motion.button
                                    animate={{ x: noPosition.x, y: noPosition.y }}
                                    onClick={handleNoMove}
                                    className="px-8 py-3 rounded-full bg-slate-200 text-slate-600 font-medium text-lg touch-none"
                                >
                                    No
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 md:p-12 rounded-3xl bg-glass backdrop-blur-md border border-glass-border shadow-2xl text-center max-w-lg w-full pointer-events-auto"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                                Yay! ❤️
                            </h2>
                            <p className="text-lg md:text-xl text-foreground leading-relaxed">
                                Get ready for cool weather, cuddles, and adventures because we’re heading to <strong>Baguio</strong> from <strong>February 12–15</strong> ❤️
                                <br /><br />
                                Our stay is all set — just bring yourself and <strong>Brielle</strong>, and let me take care of the rest.
                            </p>
                            <div className="mt-8 flex justify-center gap-2 text-primary">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                    >
                                        <Heart size={32} fill="currentColor" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

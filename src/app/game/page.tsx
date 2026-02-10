"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, RotateCcw } from "lucide-react";

import b1 from "../../assets/images/b1.png";
import b2 from "../../assets/images/b2.png";
import milk from "../../assets/images/milk.png";
import rock from "../../assets/images/rock.png";
import rock2 from "../../assets/images/rock2.png";
import rock3 from "../../assets/images/rock3.png";

const GRAVITY = 0.6;
const JUMP_STRENGTH = -8;
const OBSTACLE_SPEED = 5;
const SPAWN_RATE = 1500; // ms

const ROCKS = [rock, rock2, rock3];

interface Obstacle {
    id: number;
    x: number;
    topHeight: number;
    bottomHeight: number;
    typeTop: any;
    typeBottom: any;
}

interface Coin {
    id: number;
    x: number;
    y: number;
    collected: boolean;
}

export default function GamePage() {
    const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAME_OVER">("START");
    const [birdY, setBirdY] = useState(250);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [score, setScore] = useState(0);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [coins, setCoins] = useState<Coin[]>([]);
    const [cupidFrame, setCupidFrame] = useState(b1);

    const gameContainerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const obstacleTimerRef = useRef<number>(0);

    // Flapping animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCupidFrame(prev => (prev === b1 ? b2 : b1));
        }, 150);
        return () => clearInterval(interval);
    }, []);

    const jump = useCallback(() => {
        if (gameState === "PLAYING") {
            setBirdVelocity(JUMP_STRENGTH);
        } else if (gameState === "START") {
            setGameState("PLAYING");
            setScore(0);
            setObstacles([]);
            setCoins([]);
            setBirdY(250);
            setBirdVelocity(0);
        }
    }, [gameState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jump]);

    const gameLoop = useCallback((time: number) => {
        if (gameState !== "PLAYING") return;

        if (lastTimeRef.current !== undefined) {
            const deltaTime = time - lastTimeRef.current;

            // Bird Movement
            setBirdY(prev => {
                const newY = prev + birdVelocity;
                if (newY < 0 || newY > (gameContainerRef.current?.clientHeight || 600) - 50) {
                    setGameState("GAME_OVER");
                    return prev;
                }
                return newY;
            });
            setBirdVelocity(prev => prev + GRAVITY);

            // Obstacle Spawning
            obstacleTimerRef.current += deltaTime;
            if (obstacleTimerRef.current > SPAWN_RATE) {
                obstacleTimerRef.current = 0;
                const gap = 200;
                const containerHeight = gameContainerRef.current?.clientHeight || 600;
                const minHeight = 50;
                const topHeight = Math.random() * (containerHeight - gap - minHeight * 2) + minHeight;

                setObstacles(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        x: window.innerWidth,
                        topHeight,
                        bottomHeight: containerHeight - topHeight - gap,
                        typeTop: ROCKS[Math.floor(Math.random() * ROCKS.length)],
                        typeBottom: ROCKS[Math.floor(Math.random() * ROCKS.length)]
                    }
                ]);

                // Spawn Coin in gap
                setCoins(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        x: window.innerWidth + 50,
                        y: topHeight + gap / 2 - 15,
                        collected: false
                    }
                ]);
            }

            // Move Obstacles and Coins
            setObstacles(prev => prev
                .map(o => ({ ...o, x: o.x - OBSTACLE_SPEED }))
                .filter(o => o.x > -100)
            );
            setCoins(prev => prev
                .map(c => ({ ...c, x: c.x - OBSTACLE_SPEED }))
                .filter(c => c.x > -100)
            );

            // Collision Detection
            const cupidRect = { left: 100, top: birdY, right: 150, bottom: birdY + 50 };

            setObstacles(prev => {
                for (const o of prev) {
                    const topRect = { left: o.x, top: 0, right: o.x + 80, bottom: o.topHeight };
                    const bottomRect = { left: o.x, top: 600 - o.bottomHeight, right: o.x + 80, bottom: 600 };

                    if (
                        (cupidRect.left < topRect.right && cupidRect.right > topRect.left && cupidRect.top < topRect.bottom) ||
                        (cupidRect.left < bottomRect.right && cupidRect.right > bottomRect.left && cupidRect.bottom > bottomRect.top)
                    ) {
                        setGameState("GAME_OVER");
                    }
                }
                return prev;
            });

            setCoins(prev => prev.map(c => {
                if (!c.collected &&
                    cupidRect.left < c.x + 30 &&
                    cupidRect.right > c.x &&
                    cupidRect.top < c.y + 30 &&
                    cupidRect.bottom > c.y
                ) {
                    setScore(s => s + 10);
                    return { ...c, collected: true };
                }
                return c;
            }));
        }

        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, birdVelocity, birdY]);

    useEffect(() => {
        if (gameState === "PLAYING") {
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, gameLoop]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-100 to-pink-100 text-foreground font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-300 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Back Button */}
            <Link href="/" className="absolute top-6 left-6 z-50">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-white/50 rounded-full hover:bg-white/80 transition-all shadow-sm">
                    <ChevronLeft size={20} />
                    <span className="font-semibold">Back Home</span>
                </button>
            </Link>

            {/* Score */}
            <div className="absolute top-6 right-6 z-50 text-3xl font-bold bg-white/50 backdrop-blur-md border border-white/50 px-6 py-2 rounded-2xl shadow-sm">
                Score: {score}
            </div>

            <div
                ref={gameContainerRef}
                className="relative w-full h-full cursor-pointer"
                onClick={jump}
            >
                {/* Cupid Character */}
                <motion.div
                    className="absolute z-30"
                    style={{ left: 100, top: birdY }}
                    animate={{ rotate: birdVelocity * 2 }}
                >
                    <Image
                        src={cupidFrame}
                        alt="Cupid"
                        width={60}
                        height={60}
                        className="drop-shadow-lg"
                        priority
                    />
                </motion.div>

                {/* Obstacles */}
                {obstacles.map(o => (
                    <div key={o.id}>
                        {/* Top Rock */}
                        <div
                            className="absolute z-20"
                            style={{
                                left: o.x,
                                top: 0,
                                width: 80,
                                height: o.topHeight,
                            }}
                        >
                            <div className="relative w-full h-full overflow-hidden flex items-end justify-center">
                                <div className="absolute top-0 bottom-0 flex flex-col scale-y-[-1]">
                                    <Image src={o.typeTop} alt="rock" width={80} style={{ height: 'auto' }} />
                                    <Image src={o.typeTop} alt="rock" width={80} style={{ height: 'auto' }} className="mt-[-10px]" />
                                    <Image src={o.typeTop} alt="rock" width={80} style={{ height: 'auto' }} className="mt-[-10px]" />
                                </div>
                            </div>
                        </div>
                        {/* Bottom Rock */}
                        <div
                            className="absolute z-20"
                            style={{
                                left: o.x,
                                bottom: 0,
                                width: 80,
                                height: o.bottomHeight,
                            }}
                        >
                            <div className="relative w-full h-full overflow-hidden flex flex-col">
                                <Image src={o.typeBottom} alt="rock" width={80} style={{ height: 'auto' }} />
                                <Image src={o.typeBottom} alt="rock" width={80} style={{ height: 'auto' }} className="mt-[-10px]" />
                                <Image src={o.typeBottom} alt="rock" width={80} style={{ height: 'auto' }} className="mt-[-10px]" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Coins */}
                {coins.map(c => !c.collected && (
                    <motion.div
                        key={c.id}
                        className="absolute z-20"
                        style={{ left: c.x, top: c.y }}
                        animate={{ y: [c.y, c.y - 10, c.y] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Image src={milk} alt="milk coin" width={35} height={35} />
                    </motion.div>
                ))}
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {gameState === "START" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm"
                        >
                            <h2 className="text-3xl font-extrabold mb-4 text-primary">Cupid's Adventure</h2>
                            <p className="text-gray-600 mb-8 font-medium">
                                Help Cupid collect milk coins while avoiding the rocks! 🍼✨
                                <br />Press **Space** or **Click** to fly.
                            </p>
                            <button
                                onClick={jump}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg"
                            >
                                <Play fill="currentColor" /> Play Now
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {gameState === "GAME_OVER" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm"
                        >
                            <div className="text-6xl mb-4">💔</div>
                            <h2 className="text-4xl font-extrabold mb-2 text-primary">Game Over!</h2>
                            <p className="text-gray-500 text-xl font-bold mb-6">Score: {score}</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setGameState("START")}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg"
                                >
                                    <RotateCcw /> Retry
                                </button>
                                <Link href="/">
                                    <button className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                                        Back to Home
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

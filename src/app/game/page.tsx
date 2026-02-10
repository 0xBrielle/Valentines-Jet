"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, RotateCcw, Trophy, User } from "lucide-react";

import b1 from "../../assets/images/b1.png";
import b2 from "../../assets/images/b2.png";
import c1 from "../../assets/images/c1.png";
import milk from "../../assets/images/milk.png";
import fence from "../../assets/images/fence.png";
import gameBg from "../../assets/images/background.jpg";

const GRAVITY = 0.21;
const JUMP_STRENGTH = -5.5;
const BASE_OBSTACLE_SPEED = 3;
const BASE_SPAWN_INTERVAL = 2000;
const BASE_BG_DURATION = 11;

interface Obstacle {
    id: number;
    x: number;
    topHeight: number;
    bottomHeight: number;
}

interface Coin {
    id: number;
    x: number;
    y: number;
    collected: boolean;
}

interface ScoreEntry {
    name: string;
    score: number;
    date: string;
}

export default function GamePage() {
    const [gameState, setGameState] = useState<"MENU" | "NAME_INPUT" | "LEADERBOARD" | "PLAYING" | "GAME_OVER">("MENU");
    const [playerName, setPlayerName] = useState("");
    const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
    const [birdY, setBirdY] = useState(250);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [score, setScore] = useState(0);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [coins, setCoins] = useState<Coin[]>([]);
    const [cupidFrame, setCupidFrame] = useState(b1);
    const [spawnInterval, setSpawnInterval] = useState(2000); // 2 seconds normal
    const [gameOverRain, setGameOverRain] = useState<{ id: number; x: number; duration: number; delay: number; size: number }[]>([]);

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

    // Load leaderboard and last player name
    useEffect(() => {
        const savedScores = localStorage.getItem("flappy_brielle_scores");
        if (savedScores) setHighScores(JSON.parse(savedScores));

        const lastPlayer = localStorage.getItem("flappy_brielle_last_name");
        if (lastPlayer) setPlayerName(lastPlayer);
    }, []);

    const saveScore = useCallback((finalScore: number) => {
        if (!playerName) return;
        const newEntry: ScoreEntry = {
            name: playerName,
            score: finalScore,
            date: new Date().toLocaleDateString()
        };
        const updatedScores = [...highScores, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Keep top 10

        setHighScores(updatedScores);
        localStorage.setItem("flappy_brielle_scores", JSON.stringify(updatedScores));
        localStorage.setItem("flappy_brielle_last_name", playerName);
    }, [highScores, playerName]);

    const playCoinSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            console.warn("Audio Context error", e);
        }
    };

    // Game Over Rain logic
    useEffect(() => {
        if (gameState === "GAME_OVER") {
            const newRain = Array.from({ length: 50 }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 2,
                size: Math.random() * 60 + 40
            }));
            setGameOverRain(newRain);
        } else {
            setGameOverRain([]);
        }
    }, [gameState]);

    const startGame = useCallback(() => {
        setGameState("PLAYING");
        setGameOverRain([]);
        setScore(0);
        setObstacles([]);
        setCoins([]);
        setBirdY(250);
        setBirdVelocity(0);
        obstacleTimerRef.current = 0;
        setSpawnInterval(Math.random() * 1000 + 1500); // 1.5 - 2.5 seconds
    }, []);

    const jump = useCallback(() => {
        if (gameState === "PLAYING") {
            setBirdVelocity(JUMP_STRENGTH);
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
                const containerHeight = gameContainerRef.current?.clientHeight || 600;
                if (newY < -50 || newY > containerHeight - 120) {
                    setGameState("GAME_OVER");
                    saveScore(score);
                    return prev;
                }
                return newY;
            });
            setBirdVelocity(prev => prev + GRAVITY);

            // Obstacle Spawning
            obstacleTimerRef.current += deltaTime;
            const currentInterval = score >= 300 ? spawnInterval / 1.6 :
                score >= 200 ? spawnInterval / 1.4 :
                    score >= 100 ? spawnInterval / 1.2 : spawnInterval;

            if (obstacleTimerRef.current > currentInterval) {
                obstacleTimerRef.current = 0;
                setSpawnInterval(Math.random() * 1000 + 1500); // 1.5 - 2.5 seconds

                const gap = 380; // Significantly wider for 3x Cupid
                const containerHeight = gameContainerRef.current?.clientHeight || 600;
                const minHeight = 80;
                const topHeight = Math.random() * (containerHeight - gap - minHeight * 2) + minHeight;

                setObstacles(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        x: window.innerWidth,
                        topHeight,
                        bottomHeight: containerHeight - topHeight - gap,
                    }
                ]);

                // Spawn Coin: Randomized position (Before, Inside, or After the fence)
                const spawnChoice = Math.random();
                let coinX = window.innerWidth;
                let coinY = topHeight + gap / 2 - 22; // Center of gap by default

                if (spawnChoice < 0.33) {
                    // Before the obstacle (to the left in world space, so user sees it first)
                    // Obstacle starts at innerWidth, so before is innerWidth - distance
                    coinX = window.innerWidth - 300;
                    coinY = Math.random() * (containerHeight - 150) + 75; // Random height
                } else if (spawnChoice < 0.66) {
                    // Inside the gap
                    coinX = window.innerWidth + 25; // Center of the 100px fence
                    // coinY remains in the gap
                } else {
                    // After the obstacle (further right)
                    coinX = window.innerWidth + 350;
                    coinY = Math.random() * (containerHeight - 150) + 75; // Random height
                }

                setCoins(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        x: coinX,
                        y: coinY,
                        collected: false
                    }
                ]);
            }

            // Move Obstacles and Coins
            const currentSpeed = score >= 300 ? BASE_OBSTACLE_SPEED * 1.6 :
                score >= 200 ? BASE_OBSTACLE_SPEED * 1.4 :
                    score >= 100 ? BASE_OBSTACLE_SPEED * 1.2 : BASE_OBSTACLE_SPEED;

            setObstacles(prev => prev
                .map(o => ({ ...o, x: o.x - currentSpeed }))
                .filter(o => o.x > -150)
            );
            setCoins(prev => prev
                .map(c => ({ ...c, x: c.x - currentSpeed }))
                .filter(c => c.x > -150)
            );

            // Collision Detection
            // Cupid is 180px wide/tall now. We'll use a slightly inward bounding box for fairness.
            const cupidRect = { left: 125, top: birdY + 40, right: 235, bottom: birdY + 140 };
            const containerHeight = gameContainerRef.current?.clientHeight || 600;

            setObstacles(prev => {
                for (const o of prev) {
                    const topRect = { left: o.x, top: 0, right: o.x + 100, bottom: o.topHeight };
                    const bottomRect = { left: o.x, top: containerHeight - o.bottomHeight, right: o.x + 100, bottom: containerHeight };

                    if (
                        (cupidRect.left < topRect.right && cupidRect.right > topRect.left && cupidRect.top < topRect.bottom) ||
                        (cupidRect.left < bottomRect.right && cupidRect.right > bottomRect.left && cupidRect.bottom > bottomRect.top)
                    ) {
                        setGameState("GAME_OVER");
                        saveScore(score);
                    }
                }
                return prev;
            });

            setCoins(prev => prev.map(c => {
                if (!c.collected &&
                    cupidRect.left < c.x + 45 &&
                    cupidRect.right > c.x &&
                    cupidRect.top < c.y + 45 &&
                    cupidRect.bottom > c.y
                ) {
                    setScore(s => s + 10);
                    playCoinSound();
                    return { ...c, collected: true };
                }
                return c;
            }));
        }

        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, birdVelocity, birdY, spawnInterval]);

    useEffect(() => {
        if (gameState === "PLAYING") {
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, gameLoop]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-foreground font-sans select-none touch-none">
            {/* Scrolling Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${gameBg.src})`,
                    backgroundSize: 'auto 100%',
                    backgroundRepeat: 'repeat-x',
                    animation: gameState === 'PLAYING' ? `scrollBackground ${score >= 300 ? BASE_BG_DURATION / 1.6 :
                            score >= 200 ? BASE_BG_DURATION / 1.4 :
                                score >= 100 ? BASE_BG_DURATION / 1.2 : BASE_BG_DURATION
                        }s linear infinite` : 'none',
                    opacity: 0.8
                }}
            />

            {/* Global style for background scroll animation */}
            <style jsx global>{`
                @keyframes scrollBackground {
                    from { background-position: 0 0; }
                    to { background-position: -2000px 0; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ff7eb9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ff4d9d;
                }
            `}</style>

            {/* Background elements overlay */}
            <div className="absolute inset-0 z-1 opacity-20 pointer-events-none bg-gradient-to-b from-blue-900/20 to-pink-900/20">
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
            <div className="absolute top-6 right-6 z-50 text-3xl font-bold bg-white/50 backdrop-blur-md border border-white/50 px-6 py-2 rounded-2xl shadow-sm text-primary">
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
                        width={180}
                        height={180}
                        className="drop-shadow-lg pointer-events-none select-none"
                        priority
                        draggable={false}
                    />
                </motion.div>

                {/* Obstacles (Fences) */}
                {obstacles.map(o => (
                    <div key={o.id}>
                        {/* Top Fence */}
                        <div
                            className="absolute z-20"
                            style={{
                                left: o.x,
                                top: 0,
                                width: 100,
                                height: o.topHeight,
                            }}
                        >
                            <div className="relative w-full h-full overflow-hidden flex items-end justify-center">
                                <div className="absolute top-0 bottom-0 flex flex-col scale-y-[-1] pointer-events-none select-none">
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                    <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                </div>
                            </div>
                        </div>
                        {/* Bottom Fence */}
                        <div
                            className="absolute z-20"
                            style={{
                                left: o.x,
                                bottom: 0,
                                width: 100,
                                height: o.bottomHeight,
                            }}
                        >
                            <div className="relative w-full h-full overflow-hidden flex flex-col pointer-events-none select-none">
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                                <Image src={fence} alt="fence" width={100} style={{ height: 'auto' }} className="mt-[-1px]" draggable={false} />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Coins (Milk) */}
                {coins.map(c => !c.collected && (
                    <motion.div
                        key={c.id}
                        className="absolute z-20"
                        style={{ left: c.x, top: c.y }}
                        animate={{
                            y: [c.y, c.y - 12, c.y],
                            rotate: 360
                        }}
                        transition={{
                            y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            rotate: { repeat: Infinity, duration: 3, ease: "linear" }
                        }}
                    >
                        <Image src={milk} alt="milk coin" width={45} height={45} className="drop-shadow-glow pointer-events-none select-none" draggable={false} />
                    </motion.div>
                ))}

                {/* Game Over Rain */}
                <AnimatePresence>
                    {gameOverRain.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ y: -100, x: `${item.x}vw`, opacity: 0 }}
                            animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
                            transition={{ duration: item.duration, delay: item.delay, ease: "linear" }}
                            className="fixed z-50 pointer-events-none"
                            style={{ width: item.size }}
                        >
                            <Image src={c1} alt="raining heart" width={item.size} height={item.size} className="w-full h-auto drop-shadow-lg" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {gameState === "MENU" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full"
                        >
                            <h2 className="text-4xl font-extrabold mb-4 text-primary">Flappy Brielle</h2>
                            <p className="text-gray-600 mb-8 font-medium">
                                Help Cupid collect milk coins while avoiding the fence obstacles! 🍼✨
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setGameState("NAME_INPUT")}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg"
                                >
                                    <Play fill="currentColor" /> Start Game
                                </button>
                                <button
                                    onClick={() => setGameState("LEADERBOARD")}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-primary text-primary rounded-2xl font-bold text-xl hover:bg-pink-50 transition-colors"
                                >
                                    <Trophy size={24} /> Leaderboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {gameState === "NAME_INPUT" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-pink-100 rounded-full text-primary">
                                    <User size={40} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold mb-4 text-slate-800">Enter Player Name</h2>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 mb-6 text-center text-xl focus:border-primary outline-none transition-colors"
                                autoFocus
                            />

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={startGame}
                                    disabled={!playerName.trim()}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg disabled:opacity-50"
                                >
                                    Start !
                                </button>
                                <button
                                    onClick={() => setGameState("MENU")}
                                    className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {gameState === "LEADERBOARD" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                                    <Trophy size={28} /> High Scores
                                </h2>
                                <button
                                    onClick={() => setGameState("MENU")}
                                    className="p-2 hover:bg-slate-100 rounded-full"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                                {highScores.length > 0 ? (
                                    <div className="space-y-3">
                                        {highScores.map((entry, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-yellow-50 border-yellow-200' :
                                                    index === 1 ? 'bg-slate-50 border-slate-200' :
                                                        index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-xl font-black w-6 ${index === 0 ? 'text-yellow-600' :
                                                        index === 1 ? 'text-slate-500' :
                                                            index === 2 ? 'text-orange-600' : 'text-slate-400'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{entry.name}</p>
                                                        <p className="text-xs text-slate-400">{entry.date}</p>
                                                    </div>
                                                </div>
                                                <span className="text-2xl font-black text-primary">{entry.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        No scores yet. Be the first! 🚀
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setGameState("MENU")}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg"
                            >
                                Back to Menu
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
                            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full"
                        >
                            <div className="flex justify-center mb-4">
                                <Image src={c1} alt="Love" width={100} height={100} className="drop-shadow-lg" />
                            </div>
                            <h2 className="text-4xl font-extrabold mb-2 text-primary">Game Over!</h2>
                            <p className="text-slate-400 font-bold mb-1">{playerName}</p>
                            <p className="text-primary text-4xl font-black mb-6">Score: {score}</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={startGame}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-hover transition-colors shadow-lg"
                                >
                                    <RotateCcw /> Play Again
                                </button>
                                <button
                                    onClick={() => setGameState("MENU")}
                                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Main Menu
                                </button>
                                <Link href="/">
                                    <button className="w-full py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors">
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

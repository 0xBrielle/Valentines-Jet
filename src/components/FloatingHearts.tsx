"use client";

import { useEffect, useState } from "react";

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          left: `${Math.random() * 100}%`,
          duration: `${5 + Math.random() * 10}s`,
          size: `${10 + Math.random() * 20}px`,
        },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart"
          style={{
            left: heart.left,
            bottom: "-20px",
            animationDuration: heart.duration,
            fontSize: heart.size,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}

import FloatingHearts from "@/components/FloatingHearts";
import ValentineCard from "@/components/ValentineCard";
import BackgroundImageGrid from "@/components/BackgroundImageGrid";
import FlyingCupid from "@/components/FlyingCupid";

export default function Home() {
  return (
    <main className="min-h-screen relative bg-background overflow-hidden">
      <BackgroundImageGrid />
      {[...Array(15)].map((_, i) => (
        <FlyingCupid key={i} delay={i * 1.5} />
      ))}
      <FloatingHearts />
      <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-none">
        <ValentineCard />
      </div>
    </main>
  );
}

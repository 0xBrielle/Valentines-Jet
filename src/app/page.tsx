import FloatingHearts from "@/components/FloatingHearts";
import ValentineCard from "@/components/ValentineCard";
import BackgroundImageGrid from "@/components/BackgroundImageGrid";

export default function Home() {
  return (
    <main className="min-h-screen relative bg-background overflow-hidden">
      <BackgroundImageGrid />
      <FloatingHearts />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <ValentineCard />
      </div>
    </main>
  );
}

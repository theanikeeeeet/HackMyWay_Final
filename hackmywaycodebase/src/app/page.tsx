import { HackathonTabs } from "@/components/hackathon-tabs";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div>
      <Hero />
      <section id="listings" className="py-12 md:py-16">
        <HackathonTabs />
      </section>
    </div>
  );
}

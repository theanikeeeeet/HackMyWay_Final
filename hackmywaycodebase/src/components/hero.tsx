"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
    const stats = [
      { value: "1.5Cr+", label: "In Prizes", icon: Trophy },
      { value: "50+", label: "Hackathons", icon: Zap },
      { value: "10k+", label: "Students", icon: Users },
    ];
  
    return (
      <div className="relative overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600"
        />
        <div className="relative pt-16 pb-12 md:pt-24 md:pb-20 text-center">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4 text-white">
              Find Your Path to Innovation 🚀
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
              Discover every hackathon in India, all in one place. Your one-stop platform for the best hackathons, workshops, and coding challenges.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" asChild>
                <Link href="#listings">
                  Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/create-hackathon">Host on HackMyWay</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-white">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                      <stat.icon className="w-7 h-7 text-accent" />
                      <span className="text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-primary-foreground/80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
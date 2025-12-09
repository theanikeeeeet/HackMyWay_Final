
"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  HardHat,
  Tag,
  Share2,
  Flag,
  ExternalLink,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SourceBadge } from "@/components/source-badge";
import HackathonValidation from "./hackathon-validation";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Hackathon, WithId } from "@/lib/types";
import { doc } from "firebase/firestore";

function HackathonDetailSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="relative h-64 md:h-96 w-full bg-muted" />
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-48 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
            </div>
            <aside className="space-y-6">
              <div className="h-24 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
            </aside>
          </div>
        </div>
      </div>
    );
  }

export default function HackathonDetailClient({ hackathonId }: { hackathonId: string }) {
  const firestore = useFirestore();
  
  const hackathonRef = useMemoFirebase(() => {
    if (!firestore || !hackathonId) return null;
    return doc(firestore, "hackathons", hackathonId);
  }, [firestore, hackathonId]);

  const { data: hackathon, isLoading, error } = useDoc<Hackathon>(hackathonRef);

  const processedHackathon = useMemo(() => {
    if (!hackathon) return null;
    return {
      ...hackathon,
      startDate: hackathon.startDate?.toDate ? hackathon.startDate.toDate() : new Date(hackathon.startDate as any),
      endDate: hackathon.endDate?.toDate ? hackathon.endDate.toDate() : new Date(hackathon.endDate as any),
      registrationDeadline: hackathon.registrationDeadline?.toDate ? hackathon.registrationDeadline.toDate() : new Date(hackathon.registrationDeadline as any),
    }
  }, [hackathon]) as WithId<Hackathon> | null;


  if (isLoading) {
    return <HackathonDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center py-16">Error loading hackathon: {error.message}</div>
  }
  
  if (!processedHackathon) {
    notFound();
  }

  const {
    title,
    organizerName,
    location,
    mode,
    startDate,
    endDate,
    prizeMoney,
    participantCount,
    difficulty,
    coverImageUrl,
    imageHint,
    isScraped,
    sourcePlatform,
    description,
    rules,
    schedule,
    faqs,
    sponsors,
    registrationUrl,
    sourceUrl,
    registrationDeadline,
    tags,
  } = processedHackathon;
  
  const formattedPrize = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prizeMoney || 0);

  const detailItems = [
    { icon: Calendar, label: "Date", value: `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}` },
    { icon: MapPin, label: "Location", value: location },
    { icon: Globe, label: "Mode", value: mode },
    { icon: Trophy, label: "Prize Pool", value: formattedPrize },
    { icon: Users, label: "Participants", value: `${participantCount || 0}+` },
    { icon: HardHat, label: "Difficulty", value: difficulty || 'All' },
  ];

  const defaultCover = "https://picsum.photos/seed/default/1200/600";

  return (
    <div className="bg-background">
      <div className="relative h-64 md:h-96 w-full">
        <Image
          src={coverImageUrl || defaultCover}
          alt={title}
          fill
          className="object-cover"
          data-ai-hint={imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-12">
            {isScraped && sourcePlatform && (
                <SourceBadge platform={sourcePlatform} className="mb-2"/>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white font-headline tracking-tight">
                {title}
            </h1>
            <p className="text-lg text-gray-200 mt-2">{organizerName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>About this Hackathon</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-blue max-w-none dark:prose-invert">
                    <p>{description}</p>
                </CardContent>
            </Card>

            {isScraped && <HackathonValidation hackathon={processedHackathon} />}

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={['rules', 'schedule']} className="w-full">
                        <AccordionItem value="rules">
                            <AccordionTrigger>Rules and Judging Criteria</AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                                {rules && rules.length > 0 ? (
                                    <ul>{rules.map((rule, i) => <li key={i}>{rule}</li>)}</ul>
                                ) : <p>Rules have not been specified for this event.</p>}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="schedule">
                            <AccordionTrigger>Timeline / Schedule</AccordionTrigger>
                            <AccordionContent>
                                {schedule && schedule.length > 0 ? (
                                    <ul className="space-y-2">
                                        {schedule.map((item, i) => <li key={i} className="flex gap-4"><span className="font-semibold w-24">{item.time}</span><span>{item.event}</span></li>)}
                                    </ul>
                                ) : <p>A detailed schedule has not been provided yet.</p>}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faqs">
                            <AccordionTrigger>FAQs</AccordionTrigger>
                            <AccordionContent>
                                {faqs && faqs.length > 0 ? (
                                    faqs.map((faq, i) => (
                                        <div key={i} className="mb-4">
                                            <h4 className="font-semibold">{faq.question}</h4>
                                            <p className="text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    ))
                                ) : <p>No frequently asked questions have been added.</p>}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {sponsors && sponsors.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sponsors</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 items-center">
                        {/* Placeholder for sponsor logos */}
                        <p className="text-muted-foreground">Sponsor logos would appear here.</p>
                    </CardContent>
                </Card>
            )}

          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
            <Card>
              <CardContent className="p-6 space-y-4">
                 <Button size="lg" className="w-full" asChild>
                    <Link href={registrationUrl || sourceUrl || "#"}>
                        Register Now
                        {isScraped && <ExternalLink className="h-4 w-4 ml-2"/>}
                    </Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground">Registration closes on {format(registrationDeadline, "MMM d, yyyy")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                {detailItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-muted-foreground text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags && tags.length > 0 ? (
                            tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                        ): <p className="text-sm text-muted-foreground">No tags specified.</p>}
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-4 flex justify-around">
                    <Button variant="ghost" size="sm" className="flex gap-2"><Share2 className="h-4 w-4"/>Share</Button>
                    <Button variant="ghost" size="sm" className="flex gap-2"><Flag className="h-4 w-4"/>Report Issue</Button>
                </CardContent>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
}

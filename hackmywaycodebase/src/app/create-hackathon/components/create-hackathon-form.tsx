
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HACKATHON_DIFFICULTIES, HACKATHON_THEMES } from "@/lib/constants";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useUser, useFirestore } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const hackathonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  organizerName: z.string().min(3, "Organizer name is required."),
  description: z.string().min(50, "Description must be at least 50 characters.").max(2000),

  startDate: z.date({ required_error: "Start date is required."}),
  endDate: z.date({ required_error: "End date is required."}),
  registrationDeadline: z.date({ required_error: "Registration deadline is required."}),
  mode: z.enum(["Online", "Offline", "Hybrid"], { required_error: "Mode is required." }),
  location: z.string().optional(),
  city: z.string().optional(),

  prizeMoney: z.coerce.number().min(0, "Prize money can't be negative.").default(0),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  theme: z.string().min(3, "Please select a theme."),
  maxTeamSize: z.coerce.number().min(1, "Team size must be at least 1.").max(10),
  
  coverImage: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
  registrationUrl: z.string().url("Please enter a valid URL for the hackathon website."),
  tags: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
}).refine((data) => {
    if (data.mode === "Offline" || data.mode === "Hybrid") {
        return !!data.location && data.location.length > 3;
    }
    return true;
}, {
    message: "Location is required for Offline or Hybrid events.",
    path: ["location"],
});

type HackathonFormValues = z.infer<typeof hackathonSchema>;

type Step = {
  id: string;
  name: string;
  fields: (keyof HackathonFormValues)[];
};

const steps: Step[] = [
  { id: "01", name: "Basic Info", fields: ["title", "organizerName", "description"] },
  { id: "02", name: "Logistics", fields: ["startDate", "endDate", "registrationDeadline", "mode", "location", "city"] },
  { id: "03", name: "Details", fields: ["prizeMoney", "difficulty", "theme", "maxTeamSize"] },
  { id: "04", name: "Links & Media", fields: ["coverImage", "registrationUrl", "tags"] },
];

export function CreateHackathonForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<HackathonFormValues>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      title: "",
      organizerName: "",
      description: "",
      location: "",
      city: "",
      mode: "Online",
      difficulty: "Beginner",
      maxTeamSize: 4,
      prizeMoney: 0,
      theme: "",
      coverImage: "",
      registrationUrl: "",
      tags: "",
    }
  });

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
        setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const onSubmit = async (data: HackathonFormValues) => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to create a hackathon.",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const hackathonCollection = collection(firestore, "hackathons");
        const newHackathonRef = doc(hackathonCollection);
        
        const { prizeMoney, coverImage, ...restOfData } = data;

        const hackathonData = {
            ...restOfData,
            id: newHackathonRef.id,
            organizerId: user.uid,
            isScraped: false,
            status: 'pending_review',
            participantCount: 0,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            coverImageUrl: coverImage,
            sourcePlatform: 'User Created',
            prize1st: prizeMoney,
            prize2nd: 0,
            prize3rd: 0,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
            city: data.city || 'Online',
        };
        
        await setDoc(newHackathonRef, hackathonData);

        toast({
            title: "Hackathon Submitted!",
            description: `${data.title} has been submitted for review.`
        });
        form.reset();
        setCurrentStep(0);
        router.push(`/hackathons/${hackathonData.id}`);
    } catch (e: any) {
        console.error("Error creating hackathon: ", e);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not submit hackathon. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Info */}
            <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
            {currentStep === 0 && (
                <div className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hackathon Title</FormLabel>
                            <FormControl><Input placeholder="e.g. Code for a Cause 2024" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="organizerName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organizer Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Your College or Company" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Tell us all about your hackathon..." className="min-h-[120px]" {...field} /></FormControl>
                            <FormDescription>A brief but detailed summary of the event.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}

            {/* Step 2: Logistics */}
            {currentStep === 1 && (
                 <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="startDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="endDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="registrationDeadline" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Registration Deadline</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="mode" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Mode of Hackathon</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Online" /></FormControl>
                                <FormLabel className="font-normal">Online</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Offline" /></FormControl>
                                <FormLabel className="font-normal">Offline</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Hybrid" /></FormControl>
                                <FormLabel className="font-normal">Hybrid</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('mode') !== 'Online' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location / Venue</FormLabel>
                                    <FormControl><Input placeholder="e.g. Auditorium, IIT Bombay" {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="e.g. Mumbai" {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                 </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    <FormField control={form.control} name="prizeMoney" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Prize Pool (in INR)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 50000" {...field} /></FormControl>
                            <FormDescription>This will be displayed as the 1st prize.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="difficulty" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty level" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {HACKATHON_DIFFICULTIES.filter(d => d !== 'All').map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="theme" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a primary theme" /></SelectTrigger></FormControl>
                                <SelectContent>
                                     {HACKATHON_THEMES.filter(t => t !== 'All').map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormDescription>You can add more tags in the next step.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="maxTeamSize" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maximum Team Size</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 4" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}

            {/* Step 4: Links & Media */}
            {currentStep === 3 && (
                 <div className="space-y-6">
                    <FormField control={form.control} name="registrationUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Official Website / Registration URL</FormLabel>
                            <FormControl><Input placeholder="https://my-hackathon.com" {...field} /></FormControl>
                            <FormDescription>The main registration or information page for your event.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="coverImage" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Image URL</FormLabel>
                            <FormControl><Input placeholder="https://.../image.png" {...field} /></FormControl>
                            <FormDescription>An attractive image for your hackathon listing (e.g., from Unsplash).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl><Input placeholder="e.g. web-dev, mobile, social-good" {...field} /></FormControl>
                            <FormDescription>Comma-separated list of relevant tags.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                 </div>
            )}
            </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center pt-4">
              <div>
                <Button type="button" onClick={prev} variant="outline" className={cn(currentStep === 0 && 'invisible')}>
                    <ChevronLeft className="h-4 w-4 mr-2"/> Previous
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
                {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={next}>
                        Next <ChevronRight className="h-4 w-4 ml-2"/>
                    </Button>
                )}
                {currentStep === steps.length - 1 && (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit for Review
                    </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
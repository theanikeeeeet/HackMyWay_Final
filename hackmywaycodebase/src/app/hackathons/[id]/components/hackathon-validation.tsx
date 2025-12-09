
"use client";

import { useState } from "react";
import {
  AlertCircle,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import type { Timestamp } from "firebase/firestore";

import { validateHackathonData, ValidateHackathonDataOutput } from "@/ai/flows/hackathon-data-validation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import type { Hackathon } from "@/lib/types";

function toISOString(date: Date | Timestamp | string | undefined): string {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    if ('toDate' in date) return date.toDate().toISOString();
    return new Date().toISOString();
}


export default function HackathonValidation({ hackathon }: { hackathon: Hackathon }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidateHackathonDataOutput | null>(null);

  const handleValidation = async () => {
    setIsLoading(true);
    setResult(null);
    try {
        const response = await validateHackathonData({
            title: hackathon.title,
            description: hackathon.description,
            organizerName: hackathon.organizerName,
            location: hackathon.location,
            startDate: toISOString(hackathon.startDate),
            endDate: toISOString(hackathon.endDate),
            prizeMoney: `INR ${hackathon.prizeMoney || 0}`,
            sourcePlatform: hackathon.sourcePlatform || 'N/A',
            sourceUrl: hackathon.sourceUrl || 'N/A',
        });
      setResult(response);
    } catch (error) {
      console.error("Validation failed:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Could not validate hackathon data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confidence = result ? Math.round(result.confidenceRating * 100) : 0;
  let confidenceColor;
  if (confidence > 75) {
    confidenceColor = "bg-green-500";
  } else if (confidence > 40) {
    confidenceColor = "bg-yellow-500";
  } else {
    confidenceColor = "bg-red-500";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-primary h-6 w-6" /> AI Data Verification
            </CardTitle>
            <CardDescription className="mt-2">
              We use AI to assess the quality of scraped data. Click to run a check.
            </CardDescription>
          </div>
          <Button onClick={handleValidation} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Data with AI"
            )}
          </Button>
        </div>
      </CardHeader>
      {(isLoading || result) && (
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <div>
                    <p className="font-semibold">Analyzing Hackathon Data...</p>
                    <p className="text-sm text-muted-foreground">Our AI is checking for consistency, plausibility, and completeness.</p>
                </div>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Confidence Score</span>
                    <span className={`font-bold text-lg ${confidence > 75 ? 'text-green-600' : confidence > 40 ? 'text-yellow-600' : 'text-red-600'}`}>{confidence}%</span>
                </div>
                <Progress value={confidence} className="h-3 [&>*]:bg-green-500" />
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="summary">
                  <AccordionTrigger>Validation Summary</AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{result.validationSummary}</p>
                  </AccordionContent>
                </AccordionItem>
                {result.suggestedResolutions.length > 0 && (
                     <AccordionItem value="resolutions">
                     <AccordionTrigger>Suggested Resolutions</AccordionTrigger>
                     <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                       <ul>
                           {result.suggestedResolutions.map((res, i) => (
                               <li key={i}>{res}</li>
                           ))}
                       </ul>
                     </AccordionContent>
                   </AccordionItem>
                )}
              </Accordion>

              {confidence > 75 && (
                <div className="flex items-center gap-2 text-green-600 border border-green-200 bg-green-50 rounded-lg p-3">
                    <ThumbsUp className="h-5 w-5"/>
                    <p className="font-medium text-sm">This listing looks reliable.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

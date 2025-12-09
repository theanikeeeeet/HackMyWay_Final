import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HackathonCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}

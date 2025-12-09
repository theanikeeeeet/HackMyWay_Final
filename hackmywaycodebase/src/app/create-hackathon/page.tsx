import { CreateHackathonForm } from "./components/create-hackathon-form";

export default function CreateHackathonPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Create a New Hackathon</h1>
        <p className="text-muted-foreground">Fill in the details below to list your hackathon on HackMyWay.</p>
      </div>

      <div className="mt-8">
        <CreateHackathonForm />
      </div>
    </div>
  );
}

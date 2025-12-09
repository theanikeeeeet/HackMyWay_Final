
import { promises as fs } from 'fs';
import path from 'path';

// This tells Next.js to always render this page dynamically on the server at request time.
// This is crucial for ensuring the latest JSON data is always used.
export const dynamic = 'force-dynamic';

// Define the type for a single hackathon object for type safety.
type Hackathon = {
  id: string;
  title: string;
  description: string;
  // Add other fields from your JSON as needed
};

// Define the shape of the props our component will receive.
interface JsonFeedPageProps {
  hackathons: Hackathon[];
  error: string | null;
}

// This is the main server component for our page.
// It fetches data and then passes it to a client-side display component.
async function getHackathonData(): Promise<JsonFeedPageProps> {
  try {
    // Construct the full path to the JSON file.
    // process.cwd() gives us the root of the project directory.
    const jsonPath = path.join(process.cwd(), 'src', 'lib', 'hackathon-data.json');
    
    // Read the file content asynchronously.
    const fileContents = await fs.readFile(jsonPath, 'utf8');

    // If the file is empty, return an empty array.
    if (!fileContents) {
      return { hackathons: [], error: 'No hackathons found in the JSON file.' };
    }

    // Parse the JSON string into an array of objects.
    const data: Hackathon[] = JSON.parse(fileContents);

    // Handle case where JSON is valid but the array is empty.
    if (!Array.isArray(data) || data.length === 0) {
      return { hackathons: [], error: 'No hackathons found.' };
    }

    return { hackathons: data, error: null };
  } catch (error: any) {
    console.error('Failed to read or parse hackathon data:', error);
    
    // Distinguish between file not found and other parsing errors.
    if (error.code === 'ENOENT') {
      return { hackathons: [], error: 'Error: hackathon-data.json file not found in src/lib.' };
    }
    
    return { hackathons: [], error: 'Error: Failed to parse hackathon-data.json. Please check for syntax errors.' };
  }
}


export default async function JsonFeedPage() {
  const { hackathons, error } = await getHackathonData();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Hackathon JSON Feed</h1>
        <p className="text-muted-foreground">
          This page dynamically reads data from <code>src/lib/hackathon-data.json</code> on every request.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4 text-center">
          <h2 className="font-semibold">Could not load hackathons</h2>
          <p>{error}</p>
        </div>
      )}

      {!error && hackathons.length > 0 && (
        <div className="space-y-6">
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
              <h2 className="text-2xl font-semibold font-headline mb-2">{hackathon.title}</h2>
              <p className="text-muted-foreground">{hackathon.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


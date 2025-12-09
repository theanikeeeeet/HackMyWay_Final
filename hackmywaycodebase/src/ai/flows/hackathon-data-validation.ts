'use server';

/**
 * @fileOverview A hackathon data validation AI agent.
 *
 * - validateHackathonData - A function that validates hackathon data and provides a confidence rating.
 * - ValidateHackathonDataInput - The input type for the validateHackathonData function.
 * - ValidateHackathonDataOutput - The return type for the validateHackathonData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateHackathonDataInputSchema = z.object({
  title: z.string().describe('The title of the hackathon.'),
  description: z.string().describe('The description of the hackathon.'),
  organizerName: z.string().describe('The name of the hackathon organizer.'),
  location: z.string().describe('The location of the hackathon.'),
  startDate: z.string().describe('The start date of the hackathon (ISO format).'),
  endDate: z.string().describe('The end date of the hackathon (ISO format).'),
  prizeMoney: z.string().describe('The prize money offered in the hackathon.'),
  sourcePlatform: z.string().describe('The source platform where the hackathon was found.'),
  sourceUrl: z.string().describe('The URL of the hackathon on the source platform.'),
});
export type ValidateHackathonDataInput = z.infer<typeof ValidateHackathonDataInputSchema>;

const ValidateHackathonDataOutputSchema = z.object({
  confidenceRating: z.number().describe('A confidence rating (0-1) indicating the likelihood that the hackathon data is accurate and not misleading.'),
  validationSummary: z.string().describe('A summary of the validation results, highlighting any potential issues or discrepancies.'),
  suggestedResolutions: z.array(z.string()).describe('An array of suggested resolutions for any identified issues.'),
});
export type ValidateHackathonDataOutput = z.infer<typeof ValidateHackathonDataOutputSchema>;

export async function validateHackathonData(input: ValidateHackathonDataInput): Promise<ValidateHackathonDataOutput> {
  return validateHackathonDataFlow(input);
}

const validateHackathonDataPrompt = ai.definePrompt({
  name: 'validateHackathonDataPrompt',
  input: {schema: ValidateHackathonDataInputSchema},
  output: {schema: ValidateHackathonDataOutputSchema},
  prompt: `You are an expert in identifying potentially misleading or incorrect information in hackathon listings.

You will receive data about a hackathon, including its title, description, organizer, location, dates, prize money, source platform, and source URL.

Your task is to assess the data and provide a confidence rating indicating the likelihood that the information is accurate and not misleading. The confidence rating should be a number between 0 and 1.

You should also provide a summary of your validation results, highlighting any potential issues or discrepancies you find.

Finally, suggest resolutions for any identified issues.  Make sure the suggested resolutions are meant to be performed by a human.

Here is the hackathon data:

Title: {{{title}}}
Description: {{{description}}}
Organizer: {{{organizerName}}}
Location: {{{location}}}
Start Date: {{{startDate}}}
End Date: {{{endDate}}}
Prize Money: {{{prizeMoney}}}
Source Platform: {{{sourcePlatform}}}
Source URL: {{{sourceUrl}}}

Consider the following:

*   **Consistency:** Are the dates consistent? Does the prize money seem reasonable for the type of hackathon?
*   **Plausibility:** Is the organizer known and reputable? Does the location make sense?
*   **Completeness:** Is any crucial information missing?
*   **Source Reliability:** Is the source platform known for accurate information?

Output:
Confidence Rating (0-1): 
Validation Summary:
Suggested Resolutions:`,}
);

const validateHackathonDataFlow = ai.defineFlow(
  {
    name: 'validateHackathonDataFlow',
    inputSchema: ValidateHackathonDataInputSchema,
    outputSchema: ValidateHackathonDataOutputSchema,
  },
  async input => {
    const {output} = await validateHackathonDataPrompt(input);
    return output!;
  }
);

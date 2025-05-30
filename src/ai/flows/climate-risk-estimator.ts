
// src/ai/flows/climate-risk-estimator.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for estimating climate risk and suggesting resilience actions.
 *
 * - climateRiskEstimator - A function that takes region data and returns a climate vulnerability index and suggested actions.
 * - ClimateRiskEstimatorInput - The input type for the climateRiskEstimator function.
 * - ClimateRiskEstimatorOutput - The return type for the climateRiskEstimator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClimateRiskEstimatorInputSchema = z.object({
  regionType: z
    .string()
    .describe(
      'The type of region (e.g., coastal megacity, arid agricultural plains, mountainous forest valley). This is free-form text and can contain multiple words.'
    ),
  localEmissionLevels: z
    .string()
    .describe(
      'Description of local emission sources and levels (e.g., high from heavy industry and traffic, low - primarily residential with some commercial). This is free-form text and can contain multiple words.'
    ),
  vegetationCover: z
    .string()
    .describe(
      'Description of dominant vegetation cover in the region (e.g., dense urban parks and green corridors, sparse desert scrubland, extensive monoculture agricultural lands). This is free-form text and can contain multiple words.'
    ),
});

export type ClimateRiskEstimatorInput = z.infer<typeof ClimateRiskEstimatorInputSchema>;

const VulnerabilityPersonaSchema = z.object({
  name: z.string().describe("A short, descriptive name for the persona (e.g., 'Coastal Farmer', 'Urban Elderly Resident')."),
  description: z.string().describe("A brief description of how this persona is specifically affected by climate change in the given region.")
});

const ClimateRiskEstimatorOutputSchema = z.object({
  climateVulnerabilityIndex: z
    .number()
    .min(0).max(100)
    .describe('A climate vulnerability index (CVI) from 0-100, with 100 being the most vulnerable.'),
  suggestedActions: z
    .string()
    .describe(
      'A concise, actionable list of suggested climate resilience actions tailored to the region.'
    ),
  multiFactorScores: z.object({
    seaLevelRiskScore: z.number().min(0).max(100).optional().describe("Risk score (0-100) specifically for sea level rise impacts, if applicable to the region type. Otherwise, can be omitted or set to 0."),
    droughtFloodProbabilityScore: z.number().min(0).max(100).describe("Combined risk score (0-100) for drought and flood probability."),
    aqiTrendScore: z.number().min(0).max(100).describe("Risk score (0-100) related to negative air quality index trends and pollution."),
    healthVulnerabilityScore: z.number().min(0).max(100).describe("Risk score (0-100) for public health vulnerability to climate impacts (e.g., heatwaves, vector-borne diseases).")
  }).describe("Breakdown of risk scores for different factors, each from 0-100."),
  vulnerabilityPersonas: z.array(VulnerabilityPersonaSchema).max(2).describe("Up to two brief personas illustrating specific vulnerabilities in the region.")
});

export type ClimateRiskEstimatorOutput = z.infer<typeof ClimateRiskEstimatorOutputSchema>;

export async function climateRiskEstimator(
  input: ClimateRiskEstimatorInput
): Promise<ClimateRiskEstimatorOutput> {
  return climateRiskEstimatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'climateRiskEstimatorPrompt',
  input: {schema: ClimateRiskEstimatorInputSchema},
  output: {schema: ClimateRiskEstimatorOutputSchema},
  prompt: `You are an expert climate scientist who assesses climate risk and suggests resilience actions.

  Based on the following information about a region:
  Region Type: {{{regionType}}}
  Local Emission Levels: {{{localEmissionLevels}}}
  Vegetation Cover: {{{vegetationCover}}}

  Your tasks are to:
  1. Determine its overall Climate Vulnerability Index (CVI) on a scale of 0-100, where 0 is least vulnerable and 100 is most vulnerable.
  2. Provide a breakdown of risk scores (0-100 for each) for the following factors:
     - Sea Level Rise Impact (if the region type suggests it's coastal or low-lying near water bodies; otherwise, you can omit this or set it to a low score like 0-10).
     - Drought and Flood Probability (combined score reflecting risks of both or dominant one).
     - Air Quality Index (AQI) Trends (reflecting risks from pollution and its exacerbation by climate change).
     - Health Vulnerability (reflecting risks to public health from heatwaves, disease vectors, etc.).
  3. Suggest specific climate resilience actions tailored to the region. These should be a concise list of actionable steps.
  4. Create 1 to 2 brief "Vulnerability Personas". Each persona should have a short name (e.g., "Urban Elderly Resident", "Smallholder Farmer") and a sentence or two describing how climate change specifically impacts them in this type of region given the inputs.

  Ensure all scores are between 0 and 100. The suggested actions should be practical.
  The personas should clearly link to the region's characteristics and potential climate impacts.
  `,
});

const climateRiskEstimatorFlow = ai.defineFlow(
  {
    name: 'climateRiskEstimatorFlow',
    inputSchema: ClimateRiskEstimatorInputSchema,
    outputSchema: ClimateRiskEstimatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure seaLevelRiskScore is present if region is coastal, or default it if AI omits.
    // This is a fallback, ideally the model includes it correctly.
    if (!output?.multiFactorScores.seaLevelRiskScore && input.regionType.toLowerCase().includes('coastal')) {
        if (output?.multiFactorScores) {
            output.multiFactorScores.seaLevelRiskScore = Math.floor(Math.random() * 30) + 50; // Assign a moderate-high random if coastal and missing
        }
    } else if (!output?.multiFactorScores.seaLevelRiskScore) {
        if (output?.multiFactorScores) {
             output.multiFactorScores.seaLevelRiskScore = 0; // Default to 0 if not applicable and missing
        }
    }
    return output!;
  }
);


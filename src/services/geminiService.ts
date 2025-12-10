import { GoogleGenAI } from "@google/genai";
import { InspectionData, InspectionStatus } from "../types";
import { INSPECTION_ITEMS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeInspection = async (data: InspectionData): Promise<string> => {
  try {
    const failedItems = INSPECTION_ITEMS.filter(item => 
      data[item.id] === InspectionStatus.BAD
    );
    const attentionItems = INSPECTION_ITEMS.filter(item => 
      data[item.id] === InspectionStatus.ATTENTION
    );
    
    // Construct the prompt
    let prompt = `You are a Senior Fleet Safety Manager. Review the following truck inspection report.\n`;
    prompt += `Truck No: ${data.truckNo}, Trailer: ${data.trailerNo}, Odometer: ${data.odometer}\n`;
    
    prompt += `\nBAD / FAILED ITEMS (${failedItems.length}):\n`;
    if (failedItems.length === 0) {
      prompt += "None.\n";
    } else {
      failedItems.forEach(item => {
        prompt += `- ${item.label} (Status: Bad)\n`;
      });
    }

    prompt += `\nITEMS NEEDING ATTENTION (${attentionItems.length}):\n`;
    if (attentionItems.length === 0) {
      prompt += "None.\n";
    } else {
      attentionItems.forEach(item => {
        prompt += `- ${item.label} (Status: Needs Attention)\n`;
      });
    }

    prompt += `\nREMARKS from Inspector: ${data.remarks || "No remarks provided."}\n`;
    prompt += `\nOverall Rating given by inspector: ${data.rate}/5\n`;
    
    prompt += `\nTask:\n`;
    prompt += `1. Summarize the condition of the vehicle in 2-3 sentences.\n`;
    prompt += `2. Provide a "Safety Risk Score" from 1 (Safe) to 10 (Critical).\n`;
    prompt += `3. List immediate recommended actions for the maintenance team.\n`;
    prompt += `\nFormat the output as clean text, suitable for an email summary.`;

    const parts: any[] = [{ text: prompt }];

    // Add damage photo if it exists to the analysis
    if (data.photoDamage) {
      const base64Data = data.photoDamage.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
        parts.push({ text: "Also analyze the attached photo of the reported damage." });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "Analysis complete but no text returned.";

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "AI Analysis unavailable at this time.";
  }
};
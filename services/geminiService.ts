import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const RNP_SYSTEM_INSTRUCTION = `
You are the Official AI Recruitment Assistant for the Rwanda National Police (RNP).
Your role is to help aspiring candidates understand the recruitment process.

Key Information to know:
1. Core Values: Integrity, Service, Patriotism, Professionalism.
2. Requirements for Officers:
   - Must be of Rwandan Nationality.
   - Age: 18-25 for Basic Course, up to 30 for specialized officers.
   - Education: Minimum High School Diploma (A2) for Constables, Bachelor's (A0) for Officer Cadets.
   - Physical: Healthy, fit, minimum height 1.70m (Male), 1.65m (Female).
   - No criminal record.
3. Process: Application -> Shortlist -> Physical Test -> Written Exam -> Medical -> Training.
4. Colors: Dark Blue and Gold.

Tone: Professional, Encouraging, Strict on requirements, Respectful.
If asked about specific application status, tell them to use the "Check Status" page.
Answer briefly and clearly.
`;

export const getChatResponse = async (userMessage: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  if (!apiKey) {
    return "AI Service is currently unavailable. Please check back later.";
  }

  try {
    const model = ai.models;
    
    // Construct the prompt with history manually or use chat session if persistent
    // For this stateless function, we'll just generate content
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: RNP_SYSTEM_INSTRUCTION,
      },
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })), // Previous context
        { role: 'user', parts: [{ text: userMessage }] }
      ]
    });

    return response.text || "I am unable to provide an answer at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am experiencing technical difficulties. Please try again later.";
  }
};
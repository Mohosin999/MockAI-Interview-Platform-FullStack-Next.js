import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    // Validate API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
        { status: 500 }
      );
    }

    // Convert transcript into readable text
    const formattedTranscript = transcript
      .map((msg: { role: string; content: string }) => {
        const role = msg?.role || "User";
        const content = msg?.content || "";
        return `${role}: ${content}`;
      })
      .join("\n");

    // Generate prompt for AI
    const prompt = `
    You are an AI classifier. Based on the conversation transcript,
    decide whether it is a "mock-interview" or "interview-questions-javascript", or "interview-questions-typescript", or "interview-questions-react", or "interview-questions-nextjs".

    Return ONLY one of these five words, nothing else. If user is not response within the transcript, return empty string.
    
    Transcript:
    ${formattedTranscript}
    `.trim();

    // Initialize Gemini model
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Return only one string
    return NextResponse.json({ feedback: responseText });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

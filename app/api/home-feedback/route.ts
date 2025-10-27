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

    // ✅ Validate transcript
    // if (!Array.isArray(transcript) || transcript.length === 0) {
    //   return NextResponse.json(
    //     { error: "Transcript must be a non-empty array" },
    //     { status: 400 }
    //   );
    // }

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
    decide whether it is a "mock-interview" or "interview-questions".
    Return ONLY one of these two words, nothing else.
    
    Transcript:
    ${formattedTranscript}
    `.trim();
    // If user is not response within the transcript, return empty string.

    // Initialize Gemini model
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // let text = "";

    // // Safely extract text from response
    // if (result?.response?.text) {
    //   text = result.response.text();
    // } else {
    //   text = String(result);
    // }

    // ✅ Clean + normalize
    // const label = text.trim().toLowerCase();
    // const finalLabel =
    //   label.includes("preparation") || label === "interview-preparation"
    //     ? "interview-preparation"
    //     : "mock-interview";

    // ✅ Return only one string
    return NextResponse.json({ feedback: responseText });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

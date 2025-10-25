import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json(); // this will be your Vapi array

    // Convert array of Q&A into readable text
    const formattedText = data
      .map((item: any) => `Q: ${item.type}\nA: ${item.content}`)
      .join("\n\n");

    const prompt = `
      Based on the following conversation data, write a detailed and engaging paragraph summary 
      that captures the key information naturally, as if describing the person or situation:

      ${formattedText}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Gemini summary error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

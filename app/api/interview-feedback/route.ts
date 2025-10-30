import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, transcript } = await req.json();

    // Validate API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
        { status: 500 }
      );
    }

    // Convert messages array to prompt text
    const modifiedTranscript = transcript
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // Generate prompt from AI
    const prompt = `
You are an AI interviewer analyzing a mock interview.

Below is the entire transcript of the conversation between interviewer and candidate.
Analyze it carefully and return structured feedback as a VALID JSON OBJECT following this exact schema:

overallScore: a number from 0 to 100 representing the candidate's performance score.
role: the role the interview is for, for example "Frontend Developer".
type: the type of interview, such as "technical", "behavioral", or "mixed".
techstack: a list of technologies mentioned or used during the interview.
questionsWithAIAnswers: for each question, include the original question and a short, professional AI-crafted answer (text only).
areasForImprovement: a list of actionable suggestions based on the candidate’s answers.

{
  "overallScore": number,
  "role": string,
  "type": string,
  "techstack": string[],
  "questionsWithAIAnswers": [
    {
      "question": string,
      "answer": string
    }
  ],
  "areasForImprovement": string[]
}

IMPORTANT: Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks.

Transcript:
${modifiedTranscript}
`;

    // Initialize Gemini model
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response
    let cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Handle case where response might start/end with unwanted characters
    cleanedText = cleanedText.replace(/^[^{]*/, "").replace(/[^}]*$/, "");

    try {
      const summary = JSON.parse(cleanedText);

      // Create a clean, Firestore-compatible feedback object
      const feedback = {
        userId,
        role: String(summary.role || "Unknown role"),
        type: String(summary.type || "Unknown type"),
        techstack: (summary.techstack || [])
          .map((tech: string) => String(tech))
          .filter(Boolean),
        overallScore: summary.overallScore,
        questionsWithAIAnswers: (summary.questionsWithAIAnswers || []).map(
          (q: { question: string; answer: string }) => ({
            question: String(q.question || ""),
            answer: String(q.answer || ""),
          })
        ),
        areasForImprovement: (summary.areasForImprovement || [])
          .map((area: string) => String(area || ""))
          .filter(Boolean),
        createdAt: new Date().toISOString(),
      };

      // await db.collection("success").add({ ok: true });
      const docRef = await db.collection("feedback").add(feedback);

      return NextResponse.json({ responseText, feedbackId: docRef.id });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);

      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

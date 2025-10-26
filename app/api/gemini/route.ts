import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, userId, transcript } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert messages array to prompt text
    const modifiedTranscript = transcript
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // Generate content with more specific instructions
    const prompt = `
      You are an AI interviewer analyzing a mock interview.

      Below is the entire transcript of the conversation between interviewer and candidate.
      Analyze it carefully and return structured feedback as a VALID JSON OBJECT following this exact schema:

      {
        "totalScore": number (0-100),
        "categoryScores": [
          {
            "categoryName": string,
            "score": number (0-100),
            "comment": string
          }
        ],
        "strengths": string[],
        "areasForImprovement": string[],
        "finalAssessment": string
      }

      IMPORTANT: Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks.

      Transcript:
      ${modifiedTranscript}
    `;

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

      // const feedback = {
      //   interviewId,
      //   userId,
      //   totalScore: summary.totalScore,
      //   categoryScores: summary.categoryScores || [],
      //   strengths: summary.strengths || [],
      //   areasForImprovement: summary.areasForImprovement || [],
      //   finalAssessment: summary.finalAssessment || "No assessment provided",
      //   createdAt: new Date().toISOString(),
      // };

      // Create a clean, Firestore-compatible feedback object
      const feedback = {
        interviewId: interviewId || "",
        userId: userId || "",
        totalScore: Number(summary.totalScore) || 0,
        categoryScores: (summary.categoryScores || []).map((cat: any) => ({
          categoryName: String(cat.categoryName || ""),
          score: Number(cat.score) || 0,
          comment: String(cat.comment || ""),
        })),
        strengths: (summary.strengths || [])
          .map((s: any) => String(s || ""))
          .filter(Boolean),
        areasForImprovement: (summary.areasForImprovement || [])
          .map((a: any) => String(a || ""))
          .filter(Boolean),
        finalAssessment: String(
          summary.finalAssessment || "No assessment provided"
        ),
        createdAt: new Date().toISOString(),
      };

      // await db.collection("success").add({ ok: true });
      await db.collection("feedback").add(feedback);

      return NextResponse.json({ feedback });
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

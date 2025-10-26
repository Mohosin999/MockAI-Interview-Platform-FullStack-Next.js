// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   try {
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]

//         Thank you! <3
//     `,
//     });

//     const interview = {
//       role: role,
//       type: type,
//       level: level,
//       techstack: techstack.split(","),
//       questions: JSON.parse(questions),
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("interviews").add(interview);

//     return Response.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error: error }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }

// import { NextResponse } from "next/server";
// import { generateObject } from "ai";
// import { google } from "@ai-sdk/google";
// import { db } from "@/firebase/admin";
// import { feedbackSchema } from "@/constants";

// export async function POST(req: Request) {
//   try {
//     const { interviewId, userId, transcript } = await req.json();

//     // transcript array format করো
//     const formattedTranscript = transcript
//       .map(
//         (msg: { role: string; content: string }) =>
//           `- ${msg.role}: ${msg.content}`
//       )
//       .join("\n");

//     // Gemini call
//     const { object } = await generateObject({
//       model: google("gemini-2.0-flash-001"),
//       schema: feedbackSchema, // ✅ directly use Zod schema here
//       prompt: `
//         You are an AI interviewer analyzing a mock interview.

//         Below is the entire transcript of the conversation between interviewer and candidate.
//         Analyze it carefully and return structured feedback following the exact schema provided.

//         Transcript:
//         ${formattedTranscript}

//         Please give:
//         - A totalScore between 0 and 100
//         - For each category, provide a score and a detailed comment
//         - List of strengths and areasForImprovement as arrays of strings
//         - A finalAssessment paragraph summarizing the candidate’s performance
//       `,
//     });

//     const feedback = {
//       interviewId,
//       userId,
//       totalScore: object.totalScore,
//       categoryScores: object.categoryScores,
//       strengths: object.strengths,
//       areasForImprovement: object.areasForImprovement,
//       finalAssessment: object.finalAssessment,
//       createdAt: new Date().toISOString(),
//     };

//     const feedbackRef = await db.collection("feedback").add(feedback);

//     return NextResponse.json(
//       { success: true, feedbackId: feedbackRef.id },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error generating feedback:", error);
//     return NextResponse.json({ success: false, error }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function POST(req: Request) {
  try {
    const { interviewId, userId, messages } = await req.json();

    // transcript array format করো
    const formattedTranscript = messages
      .map(
        (msg: { role: string; content: string }) =>
          `- ${msg.role}: ${msg.content}`
      )
      .join("\n");

    // Gemini call
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema, // ✅ directly use Zod schema here
      prompt: `
        You are an AI interviewer analyzing a mock interview.

        Below is the entire transcript of the conversation between interviewer and candidate.
        Analyze it carefully and return structured feedback following the exact schema provided.

        Transcript:
        ${formattedTranscript}

        Please give:
        - A totalScore between 0 and 100
        - For each category, provide a score and a detailed comment
        - List of strengths and areasForImprovement as arrays of strings
        - A finalAssessment paragraph summarizing the candidate’s performance
      `,
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = await db.collection("feedback").add(feedback);

    return NextResponse.json(
      { success: true, feedbackId: feedbackRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

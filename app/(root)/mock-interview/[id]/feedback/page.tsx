import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getFeedbacksByUserId } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Repeat2, Undo2 } from "lucide-react";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const feedbacks = await getFeedbacksByUserId(user.id);
  const feedback = feedbacks?.find((fb: { id: string }) => fb.id === id);

  if (!feedback) {
    return (
      <section className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-3xl font-semibold text-red-400 mb-4">
          Feedback not found
        </h1>
        <Button asChild className="btn-primary">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="section-feedback bg-[#010624] max-w-7xl md:px-8 lg:px-16 pb-12 rounded-3xl space-y-4 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:items-center">
        <h2 className="mb-3 text-left">
          Feedback on the Interview -{" "}
          <span className="capitalize">{feedback.role}</span>
        </h2>

        <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-6 text-gray-300">
          {/* Overall Impression */}
          {feedback.overallScore && (
            <div className="flex items-center gap-2">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                Overall Impression:{" "}
                <span className="text-primary-200 font-bold">
                  {feedback.overallScore}
                </span>
                /100
              </p>
            </div>
          )}

          {/* Date */}
          {feedback?.createdAt && (
            <div className="flex items-center gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}</p>
            </div>
          )}
        </div>
      </div>

      {/* QUESTIONS & ANSWERS */}
      {Array.isArray(feedback.questionsWithAIAnswers) &&
        feedback.questionsWithAIAnswers.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Asked Questions & AI Answers:
            </h2>
            {feedback.questionsWithAIAnswers.map((q, i: number) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4">
                <p className="font-bold mb-2">
                  Q{i + 1}: {q.question}
                </p>
                <p className="text-gray-300">{q.answer}</p>
              </div>
            ))}
          </div>
        )}

      {/* AREAS FOR IMPROVEMENT */}
      {Array.isArray(feedback.areasForImprovement) &&
        feedback.areasForImprovement.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-white">
              Areas for Improvement
            </h2>
            <ul className="list-disc list-inside text-gray-300">
              {feedback.areasForImprovement.map((area: string, i: number) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>
        )}

      {/* TECH STACK */}
      {Array.isArray(feedback.techstack) && feedback.techstack.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-white">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {feedback.techstack.map((tech: string, i: number) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-900 font-semibold px-3 py-1 rounded-full text-base"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button asChild variant="secondary" className="flex-1 btn-primary">
          <Link href="/">
            <Undo2 /> Back to Dashboard
          </Link>
        </Button>
        <Button asChild className="flex-1 btn-primary">
          <Link href={`/mock-interview`}>
            <Repeat2 /> Retake Interview
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;

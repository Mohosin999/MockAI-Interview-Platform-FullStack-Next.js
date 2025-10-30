// import dayjs from "dayjs";
// import Link from "next/link";
// import Image from "next/image";
// import { redirect } from "next/navigation";

// import { getFeedbacksByUserId } from "@/lib/actions/general.action";
// import { Button } from "@/components/ui/button";
// import { getCurrentUser } from "@/lib/actions/auth.action";

// const Feedback = async ({ params }: RouteParams) => {
//   const { id } = await params;
//   const user = await getCurrentUser();

//   const feedbacks = await getFeedbacksByUserId(user?.id);

//   // Find the specific feedback for this interview ID
//   const feedback = feedbacks?.find((fb: { id: string }) => fb.id === id);

//   return (
//     <section className="section-feedback bg-[#001834] max-w-7xl px-16 py-12 rounded-3xl space-y-4">
//       <div className="flex flex-col justify-center">
//         <h1 className="text-4xl text-center font-semibold mb-3">
//           Feedback on the Interview -{" "}
//           <span className="capitalize">{feedback.role}</span>
//         </h1>

//         <div className="flex flex-row justify-center ">
//           <div className="flex flex-row gap-5">
//             {/* Overall Impression */}
//             <div className="flex flex-row gap-2 items-center">
//               <Image src="/star.svg" width={22} height={22} alt="star" />
//               <p>
//                 Overall Impression:{" "}
//                 <span className="text-primary-200 font-bold">
//                   {feedback.overallScore || feedback.totalScore}
//                 </span>
//                 /100
//               </p>
//             </div>

//             {/* Date */}
//             <div className="flex flex-row gap-2">
//               <Image
//                 src="/calendar.svg"
//                 width={22}
//                 height={22}
//                 alt="calendar"
//               />
//               <p>
//                 {feedback?.createdAt
//                   ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
//                   : "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* <hr /> */}

//       {/* Questions with AI Answers */}
//       {feedback.questionsWithAIAnswers &&
//         feedback.questionsWithAIAnswers.length > 0 && (
//           <div className="flex flex-col gap-4">
//             <h2 className="text-2xl">Asked Questions & AI Answers:</h2>
//             {feedback.questionsWithAIAnswers.map(
//               (question: any, index: number) => (
//                 <div key={index} className="border rounded-lg p-4">
//                   <p className="font-bold mb-2">
//                     Q{index + 1}: {question.question}
//                   </p>
//                   <p className="text-gray-300">{question.answer}</p>
//                 </div>
//               )
//             )}
//           </div>
//         )}

//       {feedback.areasForImprovement && (
//         <div className="flex flex-col gap-3">
//           <h2 className="text-2xl">Areas for Improvement</h2>
//           <ul>
//             {feedback.areasForImprovement?.map(
//               (area: string, index: number) => (
//                 <li key={index}>{area}</li>
//               )
//             )}
//           </ul>
//         </div>
//       )}

//       {/* Tech Stack */}
//       {feedback.techstack && feedback.techstack.length > 0 && (
//         <div className="flex flex-col gap-3">
//           <h2 className="text-2xl">Tech Stack</h2>
//           <div className="flex flex-wrap gap-2">
//             {feedback.techstack.map((tech: string, index: number) => (
//               <span
//                 key={index}
//                 className="bg-gray-100 text-gray-900 font-semibold px-3 py-1 rounded-full text-base"
//               >
//                 {tech}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="buttons">
//         <Button className="btn-secondary flex-1">
//           <Link href="/" className="flex w-full justify-center">
//             <p className="text-sm font-semibold text-primary-200 text-center">
//               Back to dashboard
//             </p>
//           </Link>
//         </Button>

//         <Button className="btn-primary flex-1">
//           <Link
//             href={`/interview/${id}`}
//             className="flex w-full justify-center"
//           >
//             <p className="text-sm font-semibold text-black text-center">
//               Retake Interview
//             </p>
//           </Link>
//         </Button>
//       </div>
//     </section>
//   );
// };

// export default Feedback;

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getFeedbacksByUserId } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const feedbacks = await getFeedbacksByUserId(user?.id);
  const feedback = feedbacks?.find((fb: { id: string }) => fb.id === id);

  if (!feedback) {
    return (
      <section className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-3xl font-semibold text-red-400 mb-4">
          Feedback not found
        </h1>
        <Button asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="section-feedback bg-[#001834] max-w-7xl px-16 py-12 rounded-3xl space-y-8">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-semibold mb-3">
          Feedback on the Interview -{" "}
          <span className="capitalize">{feedback.role}</span>
        </h1>

        <div className="flex flex-row justify-center gap-6 text-gray-300">
          {/* Overall Impression */}
          {(feedback.overallScore || feedback.totalScore) && (
            <div className="flex items-center gap-2">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                Overall Impression:{" "}
                <span className="text-primary-200 font-bold">
                  {feedback.overallScore || feedback.totalScore}
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
            {feedback.questionsWithAIAnswers.map((q: any, i: number) => (
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
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <Button asChild variant="secondary" className="flex-1">
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Button
          asChild
          className="flex-1 bg-primary-200 text-black font-semibold"
        >
          <Link href={`/mock-interview`}>Retake Interview</Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;

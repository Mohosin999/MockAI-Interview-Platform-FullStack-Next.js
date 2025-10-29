// import Link from "next/link";
// import Image from "next/image";

// import { Button } from "@/components/ui/button";

// import { getCurrentUser } from "@/lib/actions/auth.action";
// import {
//   getFeedbacksByUserId,
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";
// import InterviewCard from "@/components/InterviewCard";
// import VapiWidget from "@/components/VapiWidget";

// async function Home() {
//   const user = await getCurrentUser();

//   const [userInterviews, allInterview] = await Promise.all([
//     getInterviewsByUserId(user?.id!),
//     getLatestInterviews({ userId: user?.id! }),
//   ]);

//   const hasPastInterviews = userInterviews?.length! > 0;
//   const hasUpcomingInterviews = allInterview?.length! > 0;

//   const feedbacks = await getFeedbacksByUserId(user?.id);
//   console.log("akash is here", feedbacks);

//   return (
//     <>
//       <section>
//         <div className="card-cta">
//           <div className="flex flex-col gap-6 max-w-2xl">
//             <h2>
//               Read, Practice, and Perfect Your Interview Skills with Smart AI
//             </h2>
//             <p className="text-lg">
//               You can use button or AI call to go to your specific page
//             </p>

//             <div className="flex flex-col md:flex-row items-center gap-3">
//               <Button asChild className="btn-primary max-sm:w-full">
//                 <Link href="/mock-interview">Mock Interview</Link>
//               </Button>

//               <Button asChild className="btn-primary max-sm:w-full">
//                 <Link href="/interview-questions">Interview Questions</Link>
//               </Button>
//             </div>
//           </div>

//           <Image
//             src="/newRobot.png"
//             alt="robo-dude"
//             width={400}
//             height={400}
//             className="hidden lg:block"
//           />
//         </div>

//         <VapiWidget userName={user?.name!} userId={user?.id} type="generate" />
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Your Interviews</h2>

//         <div className="interviews-section">
//           {hasPastInterviews ? (
//             userInterviews?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user?.id}
//                 interviewId={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>You haven&apos;t taken any interviews yet</p>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }

// export default Home;

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbacksByUserId,
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";
import VapiWidget from "@/components/VapiWidget";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  const feedbacks = await getFeedbacksByUserId(user?.id);
  console.log("akash is here", feedbacks);

  return (
    <>
      <section>
        <div className="card-cta">
          <div className="flex flex-col gap-6 max-w-2xl">
            <h2>
              Read, Practice, and Perfect Your Interview Skills with Smart AI
            </h2>
            <p className="text-lg">
              You can use button or AI call to go to your specific page
            </p>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <Button asChild className="btn-primary max-sm:w-full">
                <Link href="/mock-interview">Mock Interview</Link>
              </Button>

              <Button asChild className="btn-primary max-sm:w-full">
                <Link href="/interview-questions">Interview Questions</Link>
              </Button>
            </div>
          </div>

          <Image
            src="/newRobot.png"
            alt="robo-dude"
            width={400}
            height={400}
            className="hidden lg:block"
          />
        </div>

        <VapiWidget userName={user?.name!} userId={user?.id} type="generate" />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {feedbacks ? (
            feedbacks?.map((feedback) => (
              <InterviewCard
                key={feedback.id}
                userId={feedback.userId}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;

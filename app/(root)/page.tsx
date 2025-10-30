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

  return (
    <>
      <section>
        <div className="card-cta">
          <div className="flex flex-col gap-6 max-w-2xl">
            <h2>Practice and Perfect Your Interview Skills with Mock AI</h2>
            <p className="text-lg">
              You can use button or AI call to go to your specific page
            </p>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <Button asChild className="btn-primary max-sm:w-full">
                <Link href="/mock-interview">Mock Interview</Link>
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

      <section className="flex flex-col gap-6">
        <h3>Interview Feedbacks</h3>

        {/* <div className="interviews-section">
          {feedbacks ? (
            feedbacks.map((feedback) => (
              <InterviewCard
                key={feedback.id}
                feedbackId={feedback.id}
                userId={feedback.userId}
                role={feedback.role}
                type={feedback.type}
                techstack={feedback.techstack}
                overallScore={feedback.overallScore}
                createdAt={feedback.createdAt}
              />
            ))
          ) : (
            <p className="text-amber-300">You haven&apos;t taken any interviews yet</p>
          )}
        </div> */}
        {feedbacks?.length > 0 ? (
          <div className="interviews-section">
            {feedbacks.map((feedback) => (
              <InterviewCard
                key={feedback.id}
                feedbackId={feedback.id}
                userId={feedback.userId}
                role={feedback.role}
                type={feedback.type}
                techstack={feedback.techstack}
                overallScore={feedback.overallScore}
                createdAt={feedback.createdAt}
              />
            ))}
          </div>
        ) : (
          <p className="text-lg">
            No feedback available yet.{" "}
            <Link
              href="/mock-interview"
              className="text-primary-200 font-medium hover:underline"
            >
              Get started!
            </Link>
          </p>
        )}
      </section>
    </>
  );
}

export default Home;

import Link from "next/link";
import Image from "next/image";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";
import VapiWidget from "@/components/VapiWidget";
import { Button } from "@/components/ui/button";

async function Home() {
  const user = await getCurrentUser();

  // Check if user is authenticated
  if (!user?.id) {
    return (
      <div>
        <h2>You are not logged in. Please sign in.</h2>
      </div>
    );
  }

  const feedbacks = await getFeedbacksByUserId(user.id);

  return (
    <>
      <section>
        {/* ----------------- Hero Section ---------------- */}
        <div className="card-cta">
          <div className="flex flex-col gap-6 max-w-2xl">
            <h2>Practice and Perfect Your Interview Skills with Mock AI</h2>
            <p className="text-lg">
              You can use the call option to select one from multiple options.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <Button asChild className="btn-primary max-sm:w-full">
                <Link href="/mock-interview">Mock Interview</Link>
              </Button>
            </div>
          </div>

          <Image
            src="/newRobot.png"
            alt="robot"
            width={400}
            height={400}
            className="hidden lg:block"
          />
        </div>

        {/* ----------------- Voice AI Section ---------------- */}
        <VapiWidget userName={user.name} userId={user.id} type="generate" />
      </section>

      {/* ----------------- Feedback Section ---------------- */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-white">
          Interview Feedbacks
        </h2>

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

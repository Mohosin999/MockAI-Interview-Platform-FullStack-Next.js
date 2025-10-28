"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  type,
  questions,
}: AgentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generatedFeedbackId, setGeneratedFeedbackId] = useState<string | null>(
    null
  );

  const router = useRouter();

  // ---------- VAPI Event Handlers ----------
  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      // Optionally handle errors by ending the call
      setCallStatus(CallStatus.FINISHED);
    };

    // Register event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup function to remove event listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // ---------- Handle Call Completion and Redirect ----------
  useEffect(() => {
    const handleCallCompletion = async () => {
      // Only proceed if call is finished and we have messages
      if (callStatus !== CallStatus.FINISHED || messages.length === 0) {
        return;
      }

      try {
        // Generate Gemini summary
        const res = await fetch("/api/home-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: messages,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("akash-luna", data.feedback);

        if (data.feedback === "mock-interview") {
          router.push("/mock-interview");
        } else if (data.feedback === "interview-questions") {
          router.push("/interview-questions");
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Gemini summary generation failed:", error);
      }
    };

    handleCallCompletion();
  }, [callStatus, messages, interviewId, userId]);

  // ---------- Handle Redirection When Feedback ID is Available ----------
  // useEffect(() => {
  //   const redirectToFeedback = () => {
  //     // Only redirect when we have a valid feedback ID and call is finished
  //     if (callStatus === CallStatus.FINISHED && generatedFeedbackId) {
  //       console.log("Redirecting to feedback page:", generatedFeedbackId);

  //       // Use setTimeout to ensure the component completes its state updates
  //       setTimeout(() => {
  //         router.push(`/interview/${generatedFeedbackId}/feedback`);
  //       }, 1000); // Small delay to ensure smooth transition
  //     }
  //   };

  //   redirectToFeedback();
  // }, [generatedFeedbackId, callStatus, router]);

  // ---------- Call Control Functions ----------
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        // Start with VAPI assistant for question generation
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_HOME_ASSISTANT_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        // Start interview with predefined questions
        let formattedQuestions = "";
        if (questions && questions.length > 0) {
          formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  // ---------- Render UI ----------
  return (
    <>
      <div className="call-view">
        {/* Microphone Button */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center">
          <button
            onClick={handleCall}
            onTouchStart={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
            // className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg"
            className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-full text-white hover:bg-red-600 transition-all shadow-lg",
              callStatus === CallStatus.ACTIVE ? "bg-green-500" : "bg-red-500"
            )}
          >
            {/* Ping Animation */}
            <span
              className={cn(
                "absolute w-full h-full rounded-full bg-red-500 opacity-75 animate-ping",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            {/* Microphone Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="relative w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 1.5a3 3 0 013 3v9a3 3 0 01-6 0v-9a3 3 0 013-3zM19.5 10.5a7.5 7.5 0 01-15 0M12 19.5v3"
              />
            </svg>
          </button>

          <h3 className="mt-10 text-lg font-semibold text-gray-700">
            {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Speak"}
          </h3>
        </div>
      </div>
    </>
  );
};

export default Agent;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { Phone, PhoneOff, PhoneCall } from "lucide-react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const Agent = ({ userName, userId, type, questions }: AgentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  const router = useRouter();

  const handleOpen = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

    const onMessage = (message: VapiMessage) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        // Only add if we have valid data
        if (message.role && message.transcript) {
          const newMessage: SavedMessage = {
            role: message.role as "user" | "assistant" | "system",
            content: message.transcript,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    };

    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      setCallStatus(CallStatus.FINISHED);
    };

    // Register event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    // Cleanup function to remove event listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
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

        if (data.feedback === "mock-interview") {
          router.push("/mock-interview");
        } else if (data.feedback === "interview-questions-javascript") {
          handleOpen(
            "https://www.geeksforgeeks.org/javascript/javascript-interview-questions/"
          );
        } else if (data.feedback === "interview-questions-typescript") {
          handleOpen(
            "https://www.geeksforgeeks.org/typescript/typescript-interview-questions/"
          );
        } else if (data.feedback === "interview-questions-react") {
          handleOpen(
            "https://www.geeksforgeeks.org/reactjs/react-interview-questions/"
          );
        } else if (data.feedback === "interview-questions-nextjs") {
          handleOpen(
            "https://www.geeksforgeeks.org/reactjs/next-js-interview-questions-answers/"
          );
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Gemini summary generation failed:", error);
      }
    };

    handleCallCompletion();
  }, [callStatus, messages, router]);

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

  // ---------- Render UI ----------
  return (
    <>
      <div className="call-view mt-8 md:mt-12">
        {/* Call Button */}
        <div className="w-full flex flex-col items-center justify-center">
          <button
            onClick={handleCall}
            onTouchStart={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
            className={cn(
              "relative flex items-center justify-center w-20 h-20 rounded-full text-white transition-all shadow-lg cursor-pointer active:scale-105",
              callStatus === CallStatus.ACTIVE
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#3EE7F6] text-gray-900 hover:bg-[#3EE7F6]/80"
            )}
          >
            {/* Ping Animation */}
            <span
              className={cn(
                "absolute w-full h-full rounded-full opacity-75",
                callStatus === CallStatus.ACTIVE
                  ? "animate-ping bg-red-500"
                  : "hidden"
              )}
            />

            {/* Call Icon */}
            {callStatus === CallStatus.ACTIVE ? (
              <Phone className="relative w-8 h-8" />
            ) : callStatus === CallStatus.CONNECTING ? (
              <PhoneCall className="relative w-8 h-8 animate-bounce" />
            ) : (
              <PhoneOff className="relative w-8 h-8" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Agent;

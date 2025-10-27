// "use client";

// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// import { cn } from "@/lib/utils";
// import { vapi } from "@/lib/vapi.sdk";
// import { interviewer } from "@/constants";

// enum CallStatus {
//   INACTIVE = "INACTIVE",
//   CONNECTING = "CONNECTING",
//   ACTIVE = "ACTIVE",
//   FINISHED = "FINISHED",
// }

// interface SavedMessage {
//   role: "user" | "system" | "assistant";
//   content: string;
// }

// interface AgentProps {
//   userName: string;
//   userId: string;
//   interviewId?: string;
//   feedbackId?: string;
//   type: "generate" | "interview";
//   questions?: string[];
// }

// const Agent = ({
//   userName,
//   userId,
//   interviewId,
//   type,
//   questions,
// }: AgentProps) => {
//   const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
//   const [messages, setMessages] = useState<SavedMessage[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [lastMessage, setLastMessage] = useState<string>("");
//   const [generatedFeedbackId, setGeneratedFeedbackId] = useState<string | null>(
//     null
//   );

//   const router = useRouter();

//   // ---------- VAPI Event Handlers ----------
//   useEffect(() => {
//     const onCallStart = () => {
//       console.log("Call started");
//       setCallStatus(CallStatus.ACTIVE);
//     };

//     const onCallEnd = () => {
//       console.log("Call ended");
//       setCallStatus(CallStatus.FINISHED);
//     };

//     const onMessage = (message: any) => {
//       if (message.type === "transcript" && message.transcriptType === "final") {
//         const newMessage = { role: message.role, content: message.transcript };
//         setMessages((prev) => [...prev, newMessage]);
//       }
//     };

//     const onSpeechStart = () => {
//       console.log("Speech started");
//       setIsSpeaking(true);
//     };

//     const onSpeechEnd = () => {
//       console.log("Speech ended");
//       setIsSpeaking(false);
//     };

//     const onError = (error: Error) => {
//       console.error("VAPI Error:", error);
//       // Optionally handle errors by ending the call
//       setCallStatus(CallStatus.FINISHED);
//     };

//     // Register event listeners
//     vapi.on("call-start", onCallStart);
//     vapi.on("call-end", onCallEnd);
//     vapi.on("message", onMessage);
//     vapi.on("speech-start", onSpeechStart);
//     vapi.on("speech-end", onSpeechEnd);
//     vapi.on("error", onError);

//     // Cleanup function to remove event listeners
//     return () => {
//       vapi.off("call-start", onCallStart);
//       vapi.off("call-end", onCallEnd);
//       vapi.off("message", onMessage);
//       vapi.off("speech-start", onSpeechStart);
//       vapi.off("speech-end", onSpeechEnd);
//       vapi.off("error", onError);
//     };
//   }, []);

//   // ---------- Update Last Message for Display ----------
//   useEffect(() => {
//     if (messages.length > 0) {
//       const latestMessage = messages[messages.length - 1].content;
//       setLastMessage(latestMessage);
//       console.log("Last message updated:", latestMessage);
//     }
//   }, [messages]);

//   // ---------- Handle Call Completion and Redirect ----------
//   useEffect(() => {
//     const handleCallCompletion = async () => {
//       // Only proceed if call is finished and we have messages
//       if (callStatus !== CallStatus.FINISHED || messages.length === 0) {
//         return;
//       }

//       try {
//         // Generate Gemini summary
//         const res = await fetch("/api/home-feedback", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             transcript: messages,
//           }),
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }

//         const data = await res.json();
//         console.log("Data---> :", data.feedback);

//         // Store the feedback ID for redirection
//         if (data.feedbackId) {
//           setGeneratedFeedbackId(data.feedbackId);
//         } else {
//           console.warn("No feedbackId received from Gemini API");
//           // Fallback to interviewId if available
//           if (interviewId) {
//             setGeneratedFeedbackId(interviewId);
//           }
//         }
//       } catch (error) {
//         console.error("Gemini summary generation failed:", error);
//         // Even if Gemini fails, we should still redirect with available IDs
//         if (interviewId) {
//           setGeneratedFeedbackId(interviewId);
//         }
//       }
//     };

//     handleCallCompletion();
//   }, [callStatus, messages, interviewId, userId]);

//   // ---------- Handle Redirection When Feedback ID is Available ----------
//   // useEffect(() => {
//   //   const redirectToFeedback = () => {
//   //     // Only redirect when we have a valid feedback ID and call is finished
//   //     if (callStatus === CallStatus.FINISHED && generatedFeedbackId) {
//   //       console.log("Redirecting to feedback page:", generatedFeedbackId);

//   //       // Use setTimeout to ensure the component completes its state updates
//   //       setTimeout(() => {
//   //         router.push(`/interview/${generatedFeedbackId}/feedback`);
//   //       }, 1000); // Small delay to ensure smooth transition
//   //     }
//   //   };

//   //   redirectToFeedback();
//   // }, [generatedFeedbackId, callStatus, router]);

//   // ---------- Call Control Functions ----------
//   const handleCall = async () => {
//     setCallStatus(CallStatus.CONNECTING);

//     try {
//       if (type === "generate") {
//         // Start with VAPI assistant for question generation
//         await vapi.start(process.env.NEXT_PUBLIC_VAPI_HOME_ASSISTANT_ID!, {
//           variableValues: {
//             username: userName,
//             userid: userId,
//           },
//         });
//       } else {
//         // Start interview with predefined questions
//         let formattedQuestions = "";
//         if (questions && questions.length > 0) {
//           formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
//         }

//         await vapi.start(interviewer, {
//           variableValues: {
//             questions: formattedQuestions,
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Failed to start call:", error);
//       setCallStatus(CallStatus.INACTIVE);
//     }
//   };

//   const handleDisconnect = () => {
//     setCallStatus(CallStatus.FINISHED);
//     vapi.stop();
//   };

//   // ---------- Render UI ----------
//   return (
//     <>
//       <div className="call-view">
//         {/* AI Interviewer Card */}
//         <div className="card-interviewer">
//           <div className="avatar">
//             <Image
//               src="/ai-avatar.png"
//               alt="AI Interviewer"
//               width={65}
//               height={54}
//               className="object-cover"
//               priority // Important for above-the-fold images
//             />
//             {/* Speaking animation indicator */}
//             {isSpeaking && <span className="animate-speak" />}
//           </div>
//           <h3>AI Interviewer</h3>
//         </div>

//         {/* Call Control Button */}
//         <div className="w-full flex justify-center mt-4">
//           {callStatus !== CallStatus.ACTIVE ? (
//             <button
//               className="relative btn-call"
//               onClick={handleCall}
//               disabled={callStatus === CallStatus.CONNECTING}
//             >
//               {/* Loading animation */}
//               <span
//                 className={cn(
//                   "absolute animate-ping rounded-full opacity-75",
//                   callStatus !== CallStatus.CONNECTING && "hidden"
//                 )}
//               />
//               <span className="relative">
//                 {callStatus === CallStatus.INACTIVE ||
//                 callStatus === CallStatus.FINISHED
//                   ? "Start Call"
//                   : "Connecting..."}
//               </span>
//             </button>
//           ) : (
//             <button className="btn-disconnect" onClick={handleDisconnect}>
//               End Call
//             </button>
//           )}
//         </div>

//         {/* Debug info (remove in production) */}
//         {process.env.NODE_ENV === "development" && (
//           <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
//             <p>Status: {callStatus}</p>
//             <p>Messages: {messages.length}</p>
//             <p>Feedback ID: {generatedFeedbackId || "Not generated"}</p>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Agent;

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
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
              priority // Important for above-the-fold images
            />
            {/* Speaking animation indicator */}
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* Call Control Button */}
        <div className="w-full flex justify-center mt-4">
          {callStatus !== CallStatus.ACTIVE ? (
            <button
              className="relative btn-call"
              onClick={handleCall}
              disabled={callStatus === CallStatus.CONNECTING}
            >
              {/* Loading animation */}
              <span
                className={cn(
                  "absolute animate-ping rounded-full opacity-75",
                  callStatus !== CallStatus.CONNECTING && "hidden"
                )}
              />
              <span className="relative">
                {callStatus === CallStatus.INACTIVE ||
                callStatus === CallStatus.FINISHED
                  ? "Start Call Akash"
                  : "Connecting..."}
              </span>
            </button>
          ) : (
            <button className="btn-disconnect" onClick={handleDisconnect}>
              End Call
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Agent;

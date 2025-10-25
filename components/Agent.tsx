// "use client";

// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// import { cn } from "@/lib/utils";
// import { vapi } from "@/lib/vapi.sdk";
// import { interviewer } from "@/constants";
// import { createFeedback } from "@/lib/actions/general.action";

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

// const Agent = ({
//   userName,
//   userId,
//   interviewId,
//   feedbackId,
//   type,
//   questions,
// }: AgentProps) => {
//   const router = useRouter();
//   const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
//   const [messages, setMessages] = useState<SavedMessage[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [lastMessage, setLastMessage] = useState<string>("");

//   useEffect(() => {
//     const onCallStart = () => {
//       setCallStatus(CallStatus.ACTIVE);
//     };

//     const onCallEnd = () => {
//       setCallStatus(CallStatus.FINISHED);
//     };

//     const onMessage = (message: Message) => {
//       if (message.type === "transcript" && message.transcriptType === "final") {
//         const newMessage = { role: message.role, content: message.transcript };
//         setMessages((prev) => [...prev, newMessage]);
//       }
//     };

//     const onSpeechStart = () => {
//       console.log("speech start");
//       setIsSpeaking(true);
//     };

//     const onSpeechEnd = () => {
//       console.log("speech end");
//       setIsSpeaking(false);
//     };

//     const onError = (error: Error) => {
//       console.log("Error:", error);
//     };

//     vapi.on("call-start", onCallStart);
//     vapi.on("call-end", onCallEnd);
//     vapi.on("message", onMessage);
//     vapi.on("speech-start", onSpeechStart);
//     vapi.on("speech-end", onSpeechEnd);
//     vapi.on("error", onError);

//     return () => {
//       vapi.off("call-start", onCallStart);
//       vapi.off("call-end", onCallEnd);
//       vapi.off("message", onMessage);
//       vapi.off("speech-start", onSpeechStart);
//       vapi.off("speech-end", onSpeechEnd);
//       vapi.off("error", onError);
//     };
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) {
//       setLastMessage(messages[messages.length - 1].content);
//     }

//     const handleGenerateFeedback = async (messages: SavedMessage[]) => {
//       console.log("handleGenerateFeedback");

//       const { success, feedbackId: id } = await createFeedback({
//         interviewId: interviewId!,
//         userId: userId!,
//         transcript: messages,
//         feedbackId,
//       });

//       if (success && id) {
//         router.push(`/interview/${interviewId}/feedback`);
//       } else {
//         console.log("Error saving feedback");
//         router.push("/");
//       }
//     };

//     if (callStatus === CallStatus.FINISHED) {
//       if (type === "generate") {
//         router.push("/");
//       } else {
//         handleGenerateFeedback(messages);
//       }
//     }
//   }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

//   const handleCall = async () => {
//     setCallStatus(CallStatus.CONNECTING);

//     if (type === "generate") {
//       await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
//         variableValues: {
//           username: userName,
//           userid: userId,
//         },
//       });
//     } else {
//       let formattedQuestions = "";
//       if (questions) {
//         formattedQuestions = questions
//           .map((question) => `- ${question}`)
//           .join("\n");
//       }

//       await vapi.start(interviewer, {
//         variableValues: {
//           questions: formattedQuestions,
//         },
//       });
//     }
//   };

//   const handleDisconnect = () => {
//     setCallStatus(CallStatus.FINISHED);
//     vapi.stop();
//   };

//   return (
//     <>
//       <div className="call-view">
//         {/* AI Interviewer Card */}
//         <div className="card-interviewer">
//           <div className="avatar">
//             <Image
//               src="/ai-avatar.png"
//               alt="profile-image"
//               width={65}
//               height={54}
//               className="object-cover"
//             />
//             {isSpeaking && <span className="animate-speak" />}
//           </div>
//           <h3>AI Interviewer</h3>
//         </div>

//         {/* User Profile Card */}
//         <div className="card-border">
//           <div className="card-content">
//             <Image
//               src="/user-avatar.png"
//               alt="profile-image"
//               width={539}
//               height={539}
//               className="rounded-full object-cover size-[120px]"
//             />
//             <h3>{userName}</h3>
//           </div>
//         </div>
//       </div>

//       {messages.length > 0 && (
//         <div className="transcript-border">
//           <div className="transcript">
//             <p
//               key={lastMessage}
//               className={cn(
//                 "transition-opacity duration-500 opacity-0",
//                 "animate-fadeIn opacity-100"
//               )}
//             >
//               {lastMessage}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="w-full flex justify-center">
//         {callStatus !== "ACTIVE" ? (
//           <button className="relative btn-call" onClick={() => handleCall()}>
//             <span
//               className={cn(
//                 "absolute animate-ping rounded-full opacity-75",
//                 callStatus !== "CONNECTING" && "hidden"
//               )}
//             />

//             <span className="relative">
//               {callStatus === "INACTIVE" || callStatus === "FINISHED"
//                 ? "Call"
//                 : ". . ."}
//             </span>
//           </button>
//         ) : (
//           <button className="btn-disconnect" onClick={() => handleDisconnect()}>
//             End
//           </button>
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
import { createFeedback } from "@/lib/actions/general.action";
import ChatDisplay from "./ChatDisplay";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

// interface SavedMessage {
//   role: "user" | "system" | "assistant";
//   content: string;
// }

type SavedMessage = {
  type: "assistant" | "user";
  content: string;
  timestamp: string;
};

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>

      <div>
        <ChatDisplay messages={messages} />
      </div>
    </>
  );
};

export default Agent;

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
//   feedbackId,
//   type,
//   questions,
// }: AgentProps) => {
//   const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
//   const [messages, setMessages] = useState<SavedMessage[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [lastMessage, setLastMessage] = useState<string>("");
//   const [geminiSummary, setGeminiSummary] = useState<string>("");

//   const router = useRouter();

//   // ---------- VAPI event handlers ----------
//   useEffect(() => {
//     const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
//     const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

//     const onMessage = (message: any) => {
//       if (message.type === "transcript" && message.transcriptType === "final") {
//         const newMessage = { role: message.role, content: message.transcript };
//         setMessages((prev) => [...prev, newMessage]);
//       }
//     };

//     const onSpeechStart = () => setIsSpeaking(true);
//     const onSpeechEnd = () => setIsSpeaking(false);
//     const onError = (error: Error) => console.log("VAPI Error:", error);

//     vapi.on("call-start", onCallStart);
//     vapi.on("call-end", onCallEnd);
//     vapi.on("message", onMessage);
//     vapi.on("speech-start", onSpeechStart);
//     vapi.on("speech-end", onSpeechEnd);
//     vapi.on("error", onError);

//     return () => {
//       vapi.off("call-start", onCallStart);
//       vapi.off("call-end", onCallEnd);
//       vapi.off("message", onMessage);
//       vapi.off("speech-start", onSpeechStart);
//       vapi.off("speech-end", onSpeechEnd);
//       vapi.off("error", onError);
//     };
//   }, []);

//   // ---------- Update last message ----------
//   useEffect(() => {
//     if (messages.length > 0) {
//       setLastMessage(messages[messages.length - 1].content);
//     }
//   }, [messages]);

//   // ---------- Handle Call End ----------
//   useEffect(() => {
//     const generateFeedback = async () => {
//       if (type === "generate") {
//         router.push("/");
//         return;
//       }

//       try {
//         const res = await fetch("/api/vapi/feedback", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             interviewId,
//             userId,
//             transcript: messages,
//           }),
//         });

//         const data = await res.json();

//         if (data.success) {
//           router.push(`/interview/${interviewId}/feedback`);
//         } else {
//           console.log("Error generating feedback:", data.error);
//           router.push("/");
//         }
//       } catch (error) {
//         console.log("Feedback generation failed:", error);
//         router.push("/");
//       }
//     };

//     // ---------- Gemini Summary Generation ----------
//     const generateGeminiSummary = async () => {
//       if (messages.length === 0) return;

//       try {
//         console.log("Sending transcript to Gemini...", messages);
//         const res = await fetch("/api/gemini-summary", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ data: messages }),
//         });

//         const data = await res.json();
//         console.log("Gemini Summary:", data, data.summary);
//         setGeminiSummary(data.summary);
//       } catch (error) {
//         console.log("Gemini summary failed:", error);
//       }
//     };

//     if (callStatus === CallStatus.FINISHED) {
//       generateFeedback();
//       generateGeminiSummary();
//     }
//   }, [callStatus, messages, interviewId, type, userId, router]);

//   // ---------- Call Control ----------
//   const handleCall = async () => {
//     setCallStatus(CallStatus.CONNECTING);

//     if (type === "generate") {
//       await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
//         variableValues: {
//           username: userName,
//           userid: userId,
//         },
//       });
//     } else {
//       let formattedQuestions = "";
//       if (questions) {
//         formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
//       }

//       await vapi.start(interviewer, {
//         variableValues: {
//           questions: formattedQuestions,
//         },
//       });
//     }
//   };

//   const handleDisconnect = () => {
//     setCallStatus(CallStatus.FINISHED);
//     vapi.stop();
//   };

//   // ---------- UI ----------
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
//             />
//             {isSpeaking && <span className="animate-speak" />}
//           </div>
//           <h3>AI Interviewer</h3>
//         </div>

//         {/* User Profile Card */}
//         <div className="card-border">
//           <div className="card-content">
//             <Image
//               src="/user-avatar.png"
//               alt="User Avatar"
//               width={120}
//               height={120}
//               className="rounded-full object-cover"
//             />
//             <h3>{userName}</h3>
//           </div>
//         </div>
//       </div>

//       {/* Transcript Preview */}
//       {messages.length > 0 && (
//         <div className="transcript-border">
//           <div className="transcript">
//             <p
//               key={lastMessage}
//               className={cn(
//                 "transition-opacity duration-500 opacity-0",
//                 "animate-fadeIn opacity-100"
//               )}
//             >
//               {lastMessage}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Gemini Summary Display */}
//       {geminiSummary && (
//         <div className="p-4 bg-gray-100 rounded-md mt-4">
//           <h3>📝 Gemini Summary</h3>
//           <p>{geminiSummary}</p>
//         </div>
//       )}

//       {/* Call Control Button */}
//       <div className="w-full flex justify-center mt-4">
//         {callStatus !== CallStatus.ACTIVE ? (
//           <button className="relative btn-call" onClick={handleCall}>
//             <span
//               className={cn(
//                 "absolute animate-ping rounded-full opacity-75",
//                 callStatus !== CallStatus.CONNECTING && "hidden"
//               )}
//             />
//             <span className="relative">
//               {callStatus === CallStatus.INACTIVE ||
//               callStatus === CallStatus.FINISHED
//                 ? "Call"
//                 : ". . ."}
//             </span>
//           </button>
//         ) : (
//           <button className="btn-disconnect" onClick={handleDisconnect}>
//             End
//           </button>
//         )}
//       </div>
//     </>
//   );
// };

// export default Agent;

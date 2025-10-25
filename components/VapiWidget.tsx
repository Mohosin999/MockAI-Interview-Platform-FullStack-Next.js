// "use client";

// import React, { useState, useEffect } from "react";
// import Vapi from "@vapi-ai/web";

// const VapiWidget: React.FC = () => {
//   const [error, setError] = useState<string>("");
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);

//   useEffect(() => {
//     // Initialize Vapi instance
//     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
//     setVapiInstance(vapi);

//     // Set up event listeners
//     vapi.on("call-start", () => {
//       console.log("Call started");
//       setIsCallActive(true);
//     });

//     vapi.on("call-end", () => {
//       console.log("Call ended");
//       setIsCallActive(false);
//     });

//     // Cleanup
//     return () => {
//       vapi?.stop();
//     };
//   }, []);

//   const handleCall = async () => {
//     try {
//       if (isCallActive) {
//         // End call
//         await vapiInstance?.stop();
//       } else {
//         // Start call
//         await vapiInstance?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
//       }
//     } catch (err) {
//       console.error("Vapi error:", err);
//       setError(err.message);
//       setIsCallActive(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handleCall}
//         style={{
//           backgroundColor: isCallActive ? "#ff4444" : "#4CAF50",
//           color: "white",
//           padding: "10px 20px",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         {isCallActive ? "End Call" : "Start Call"}
//       </button>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default VapiWidget;

"use client";

import React, { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const VapiWidget: React.FC = () => {
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
    setVapiInstance(vapi);

    // Event handlers
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: any) => {
      // Only final transcript messages
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (err: Error) => console.error("Vapi Error:", err);

    // Attach listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      // Cleanup
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.stop();
    };
  }, []);

  const handleCall = async () => {
    if (!vapiInstance) return;

    try {
      if (callStatus === CallStatus.ACTIVE) {
        await vapiInstance.stop();
      } else {
        await vapiInstance.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
      }
    } catch (err: any) {
      console.error("Vapi call error:", err);
      setError(err.message || "Unknown error");
    }
  };

  return (
    <div>
      <button
        onClick={handleCall}
        style={{
          backgroundColor:
            callStatus === CallStatus.ACTIVE ? "#ff4444" : "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {callStatus === CallStatus.ACTIVE ? "End Call" : "Start Call"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Combined messages */}
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            backgroundColor: "#000",
            padding: "10px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
          }}
        >
          {messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")}
        </div>
      </div>
    </div>
  );
};

export default VapiWidget;

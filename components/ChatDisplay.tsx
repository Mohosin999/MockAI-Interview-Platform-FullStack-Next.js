// components/ChatDisplay.tsx
import React from "react";

type Message = {
  type: "assistant" | "user";
  content: string;
};

type ChatDisplayProps = {
  messages: Message[];
};

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  const combinedMessages: Message[] = [];
  let assistantBuffer = "";

  messages.forEach((msg) => {
    if (msg.type === "assistant") {
      assistantBuffer += (assistantBuffer ? " " : "") + msg.content;
    } else {
      // Push buffered assistant message first
      if (assistantBuffer) {
        combinedMessages.push({ type: "assistant", content: assistantBuffer });
        assistantBuffer = "";
      }
      combinedMessages.push(msg);
    }
  });

  // Push remaining assistant messages
  if (assistantBuffer) {
    combinedMessages.push({ type: "assistant", content: assistantBuffer });
  }

  return (
    <div>
      {combinedMessages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.type}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;

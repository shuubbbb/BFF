"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const P = 6; // pixel unit

function PixelCloud({ size = 40 }: { size?: number }) {
  const scale = size / 80;
  // pixel grid: each rect is P×P, cloud shape in pixel art
  const pixels = [
    // row 1 (top bumps)
    [2,1],[3,1],[4,1],
    [6,1],[7,1],[8,1],
    // row 2
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
    // row 3
    [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
    // row 4
    [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    // row 5
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
  ];
  // shadow pixels (bottom-right offset, darker)
  const shadow = [
    [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
    [10,4],[10,5],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "pixelated" }}
    >
      <rect width="80" height="80" rx="16" fill="#D4A017" />
      {shadow.map(([x, y], i) => (
        <rect
          key={`s${i}`}
          x={x * P + 5}
          y={y * P + 12}
          width={P}
          height={P}
          fill="#A07810"
        />
      ))}
      {pixels.map(([x, y], i) => (
        <rect
          key={`p${i}`}
          x={x * P + 5}
          y={y * P + 10}
          width={P}
          height={P}
          fill={y <= 2 ? "#FFFFFF" : "#F0F8FF"}
        />
      ))}
      {/* shine pixels */}
      <rect x={11} y={22} width={P} height={P} fill="#FFFFFF" opacity="0.9" />
      <rect x={17} y={16} width={P} height={P} fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + text,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "오류가 발생했어. 다시 시도해줘!",
        };
        return updated;
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "#F8F9F9", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Apple SD Gothic Neo', 'Helvetica Neue', sans-serif", fontWeight: 450 }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 py-3"
        style={{ background: "#F8F9F9" }}
      >
        <PixelCloud size={42} />
        <div>
          <h1 className="font-semibold text-sm" style={{ color: "#3d2c1e" }}>
            &lt;3
          </h1>
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
        style={{ background: "#F8F9F9" }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <PixelCloud size={80} />
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 max-w-xl mx-auto w-full ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 self-end mb-1">
                <PixelCloud size={36} />
              </div>
            )}

            <div className="flex flex-col gap-1" style={{ maxWidth: "75%" }}>
              <div
                className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background:
                    msg.role === "user" ? "#4a2c1a" : "#ffffff",
                  color: msg.role === "user" ? "#f5ede4" : "#3d2c1e",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  boxShadow: "0 1px 4px rgba(180,120,80,0.10)",
                  fontWeight: 450,
                }}
              >
                {msg.content}
                {msg.role === "assistant" &&
                  isLoading &&
                  i === messages.length - 1 &&
                  msg.content === "" && (
                    <span className="inline-flex gap-1 items-center h-4">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#c4956a", animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#c4956a", animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#c4956a", animationDelay: "300ms" }}
                      />
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 pb-5 pt-3"
        style={{ background: "#F8F9F9" }}
      >
        <div className="max-w-xl mx-auto flex items-end gap-2">
          <div
            className="flex-1 flex items-end rounded-2xl px-4 py-2.5"
            style={{ background: "#E8E9E9" }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="메시지 보내기..."
              className="flex-1 bg-transparent resize-none outline-none text-sm max-h-40"
              style={{ color: "#3d2c1e", fontWeight: 450 }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
            style={{
              background:
                !input.trim() || isLoading ? "#d0c4bc" : "#8B2020",
              cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-chat";

const quickActions = [
  "Why did I lose money?",
  "What's my weakness?",
  "Give me a rule",
  "How to improve?",
];

export function AiCoachChat() {
  const { token } = useAuth();
  const { data: history } = useChatHistory(token);
  const sendMessage = useSendChatMessage(token);

  const [input, setInput] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = [...(history || []), ...optimisticMessages];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || sendMessage.isPending) return;

    setInput("");
    setOptimisticMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const result = await sendMessage.mutateAsync(message);
      setOptimisticMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: result.response },
      ]);
    } catch (err) {
      setOptimisticMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble processing that. Please try again." },
      ]);
    }
  };

  return (
    <Card className="flex h-[500px] flex-col">
      <CardHeader className="pb-3 border-b border-white/[0.04]">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/10 text-sm">🤖</span>
          AI Coach
          <span className="relative flex h-2 w-2 ml-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/10 text-3xl">
                🤖
              </div>
              <p className="mt-3 text-sm font-medium text-[#94a3b8]">
                Ask me anything about your trading
              </p>
              <p className="mt-1 text-xs text-[#475569]">
                I analyze your patterns and give personalized advice
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-in flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.25)]"
                    : "border border-white/[0.06] bg-white/[0.04] text-[#e2e8f0]"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="chat-bubble-in flex justify-start">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-white/[0.03]">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="whitespace-nowrap rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-[#94a3b8] transition-all hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-purple-300"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.04] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your AI coach..."
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-purple-500/30 focus:bg-white/[0.04] focus:outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={sendMessage.isPending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
